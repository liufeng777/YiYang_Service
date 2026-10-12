# 幸福颐养数智化平台 — 协同工作台端（院内医护/健管师后台）API 接口设计

> 版本：v0.1 ｜ 依据：PRD v2.7 + 数据库设计 v1.10（9 域 67 表） ｜ 网关前缀：`/api/v1/staff`
> 使用对象：**院内医护（`institution_staff.staff_type=1` 医护管理）与健管师/运营人员**，通过 Web 协同工作台操作。
> 本端与「医护服务小程序端（`/api/v1/sminiapp`，`staff_type=2`）」、运营后台端（`/api/v1/admin`）职责区分：本端负责**线索跟进/分配、会员健康档案与评估建档、健康方案/目标/AI 方案生成、服务人员管理、排班排单、工单派单/改派/催单、预约咨询、到院登记、回访/预警处置**；上门签到签退执行留痕在小程序端完成。
> 所有字段名与枚举语义**严格对齐数据库设计 v1.10**。

---

## 0. 通用约定

> **本端响应结构、分页、鉴权、时间戳与金额格式、错误码、状态枚举、上传与批量契约等一律引用《共通API》**（`docs/api/共通-API设计.md`）。本端仅保留**端特有**约定。

### 0.1 统一响应 / 分页 / 时间与金额 / 错误码
- 统一响应 `{code, message, data}`、分页 `{list,total,page,page_size}`、时间戳 UTC 秒、金额 `DECIMAL(10,2)`，见共通 §1/§2/§4/§5。
- **错误码统一收敛为短码**：成功 `0`、参数 `400`、未登录 `401`、无权限 `403`、资源不存在 `404`、限流 `429`、内部错误 `500`、业务冲突 `600`（见共通 §4；废弃历史 `4001/4010/4030/5000/6001/6002` 长编码）。
- 手机号、身份证号出参须脱敏展示；健康/定位数据仅在授权机构范围内返回（PRD §5.8）。

### 0.2 鉴权（本端特有）
- Header：`Authorization: Bearer ***`（通用见共通 §3）。
- 登录来源：`institution_staff`（手机号 `phone` + 密码 `password_hash`），**仅限 `staff_type=1` 医护管理/健管师/运营**；`staff_type=2`（医护服务上门人员）不允许登录本端 Web（其端为小程序）。
- 每个接口标注权限码（`permissions.code`）。本端常见分组前缀：`staff:`（本人/本机构）、`lead:`（线索）、`health:`（健康档案/评估/方案/目标）、`fa:`（随访）、`warn:`（预警）、`staffmgr:`（服务人员管理）、`schedule:`（排班）、`wo:`（工单）、`dispatch:`（排单派单）、`appt:`（预约）、`consult:`（咨询）、`visit:`（到院登记）。

### 0.3 状态机（本端涉及，枚举见共通 §6）
- **工单状态** `work_orders.wo_status`：见共通 §6.2。仅邻近状态正向流转。本端负责**派单（1→排单）与改派/催单/取消**，接单及之后由小程序端流转。
- **排单状态** `service_schedules.schedule_status`：见共通 §6.3。
- **线索状态** `leads.status`：见共通 §6.5。
- **预约状态** `appointments.status`：见共通 §6.6。
- **健康评估/方案/目标/随访/预警状态**：分别见共通 §6.7/§6.8/§6.9/§6.10/§6.11。
- 等级变更统一追加 `risk_level_changes`（`level_type`：1-健康风险 2-照护），取 `(member_id, level_type, created_at)` 最新一条为当前等级。

---

## 1. 认证与会话（Auth）

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 登录（手机号+密码） | POST | `/api/v1/staff/auth/login` | 公开 | 医护管理/健管师登录 |
| 登录（短信验证码） | POST | `/api/v1/staff/auth/sms-login` | 公开 | 手机号+验证码 |
| 发送短信验证码 | POST | `/api/v1/staff/auth/sms-code` | 公开 | 登录验证码（限流） |
| 当前账号信息 | GET | `/api/v1/staff/auth/profile` | 登录态 | 本人+机构+权限码 |
| 修改密码 | POST | `/api/v1/staff/auth/change-password` | 登录态 | 修改本人登录密码 |
| 登出 | POST | `/api/v1/staff/auth/logout` | 登录态 | 注销会话 |

### 1.1 登录（手机号+密码）
POST `/api/v1/staff/auth/login`
**入参：**
```json
{ "phone": "13800000000", "password": "***" }
```
**校验：** ① 账号存在且 `institution_staff.staff_type=1`；② `status=1`（在职，`9-离职` 禁止登录）；③ 密码与 `password_hash` BCrypt 比对。连续 5 次错误锁定 10 分钟。
**出参 data：**
```json
{
  "token": "***", "expires_in": 86400,
  "staff": {
    "id": 5, "institution_id": 1, "institution_name": "幸福护理院",
    "staff_type": 1, "name": "张护士长", "phone": "138****0000",
    "avatar_url": "https://...", "title": "主管护师",
    "position": {"id": 1, "position_name": "护士长", "position_code": "NURSE_HEAD"},
    "permissions": ["lead:view","health:view","wo:dispatch","schedule:manage", "..."]
  }
}
```

### 1.2 登录（短信验证码）
POST `/api/v1/staff/auth/sms-login`
**入参：** `{ "phone": "13800000000", "sms_code": "123456" }`
**出参 data：** 同 1.1 的 `token` + `staff`。

### 1.3 发送短信验证码
POST `/api/v1/staff/auth/sms-code`
**入参：** `{ "phone": "13800000000", "scene": "login" }`  // scene：login / change-phone
**出参 data：** `{ "sms_trace_id": "xxx", "expires_in": 300 }`
> 限流：10 次/分钟/IP；同一手机号 1 分钟内 1 次。

### 1.4 获取当前账号信息
GET `/api/v1/staff/auth/profile`
**出参 data：** 同 1.1 的 `staff` 对象（含本人资质快照 `credentials`、服务分类、机构信息）。

### 1.5 修改密码
POST `/api/v1/staff/auth/change-password`
**入参：** `{ "old_password": "旧密码", "new_password": "新密码" }`
> 校验旧密码正确；新密码≥6 位；成功后更新 `password_hash` 并作废当前 token。

### 1.6 登出
POST `/api/v1/staff/auth/logout`，无入参，服务端注销 token。

---

## 2. 工作台首页概览（Dashboard）

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 今日工作概览 | GET | `/api/v1/staff/dashboard/overview` | `staff:dashboard` | 今日核心待办聚合 |
| 异常健康预警待处置 | GET | `/api/v1/staff/dashboard/warnings` | `staff:dashboard` | 首页预警快捷清单 |

### 2.1 今日工作概览
GET `/api/v1/staff/dashboard/overview`
**出参 data：**
```json
{
  "institution_id": 1,
  "today": { "pending_dispatch": 3, "dispatch_confirming": 1, "wo_running": 5,
             "wo_completed": 12, "scheduled_staff": 8 },
  "lead": { "new": 4, "followup_due_today": 2 },
  "appointment": { "confirmed_today": 3, "arriving_today": 2 },
  "health": { "pending_assessment": 1, "warn_active": 6, "warn_high": 2,
              "followup_due_today": 3, "plan_pending_confirm": 1 },
  "visit": { "today_visit": 2 }
}
```

### 2.2 首页预警快捷提示
GET `/api/v1/staff/dashboard/warnings?start&end&severity`
**出参 data：** 分页返回 `health_warnings` 精简列表（`{id, member_id, member_name, severity, title, warning_status}`）。

---

## 3. 线索管理（Lead）

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 线索列表 | GET | `/api/v1/staff/leads` | `lead:view` | 分页，按机构/状态/来源/负责人/关键字 |
| 线索详情 | GET | `/api/v1/staff/leads/:id` | `lead:view` | 含跟进与转派留痕 |
| 领取/分配负责人 | POST | `/api/v1/staff/leads/:id/assign` | `lead:assign` | 指定负责人 |
| 转派 | POST | `/api/v1/staff/leads/:id/transfer` | `lead:assign` | 转派并留痕 |
| 跟进 | POST | `/api/v1/staff/leads/:id/followup` | `lead:followup` | 追加跟进记录+更新状态 |
| 标记流失/无效 | POST | `/api/v1/staff/leads/:id/lost` | `lead:followup` | 置 6-lost/9-ignore |
| 线索转化健档 | POST | `/api/v1/staff/leads/:id/convert` | `lead:convert` | 转化并建立健康档案 |

### 3.1 线索列表
GET `/api/v1/staff/leads?status=1&source_type=1&owner_staff_id=5&priority=&keyword=&start_date=&end_date=`
> 仅返回本机构线索；`keyword` 匹配 `lead_no/contact_name/contact_phone`。
**出参 data：**
```json
{ "list": [{
  "id": 1, "lead_no": "LEAD20260820001", "institution_id": 1,
  "source_type": 1, "source_id": 88,
  "member_id": null, "user_id": 12,
  "contact_name": "王阿姨", "contact_phone": "138****0000",
  "demand_type": 1, "demand_detail": "需要居家护理",
  "status": 1, "priority": 2,
  "owner_staff_id": 5, "owner_staff_name": "张护士长", "assign_at": 1755580800,
  "followup_count": 2, "last_followup_at": 1755667200,
  "created_at": 1755568200
}], "total": 23, "page": 1, "page_size": 10 }
```

### 3.2 线索详情
GET `/api/v1/staff/leads/:id`
**出参 data：** 线索全字段 + `followup_records`（JSON 数组）+ `transfer_records`（JSON 数组）。

### 3.3 领取/分配线索
POST `/api/v1/staff/leads/:id/assign`
**入参：** `{ "owner_staff_id": 6, "reason": "由王阿姨家属电话咨询转入" }`
> 服务端冗余 `owner_staff_name`，回填 `assign_at`；若线索当前无负责人则记「领取」，已有负责人则等价于转派（走 `transfer_records`）。
**出参 data：** `{ "id": 1, "owner_staff_id": 6, "owner_staff_name": "李护士", "assign_at": 1755600000 }`

### 3.4 转派
POST `/api/v1/staff/leads/:id/transfer`
**入参：** `{ "to_staff_id": 7, "reason": "客户区域归属调整" }`
**出参 data：** `{ "transfer_records": [ { "from_staff_id":5,"from_staff_name":"王护士长","to_staff_id":7,"to_staff_name":"刘主管","operator_id":5,"operator_name":"王护士长","reason":"客户区域归属调整","time":1755600600 } ] }`

### 3.5 跟进
POST `/api/v1/staff/leads/:id/followup`
**入参：**
```json
{
  "contact_time": 1755601200,
  "content": "已电话联系，介绍居家护理套餐，约定到院参观",
  "next_action_at": 1755687600,
  "status": 3,             // 跟进后线索状态：3-interested
  "demand_type": 1, "demand_detail": "更新后的需求详情（可空）"
}
```
**逻辑：** 追加 `followup_records` 一条 `{time, staff_id, staff_name, content}`；更新 `status`；触发生成 `health_followups(source_type=5, source_id=lead.id)` 的线索回访（见 §6）。

### 3.6 流失/无效
POST `/api/v1/staff/leads/:id/lost`
**入参：** `{ "status": 6, "lost_reason": "已选择其他机构", "remark": "" }`  // status：6-lost / 9-ignore

### 3.7 线索转化建立健康档案
POST `/api/v1/staff/leads/:id/convert`
**入参：**
```json
{
  "member": { "name":"王阿姨","gender":2,"birthday":"1955-08-20","phone":"13800000000",
              "id_card":"410**********","emergency_contact":"李女士","emergency_phone":"13900000000",
              "nursing_home_id":1,"station_id":null },
  "user_id": 12,               // 可选，关联已注册用户
  "initial_status": 1          // 会员建档初态：1-未实名 2-已实名
}
```
**逻辑：** ① 创建 `members` 档案；② 回填 `leads.member_id`，置 `leads.status=5-converted`、`converted_at`；③ 生成首次评估待办（`health_assessments(assessment_type=1 初次)`，状态 draft）。姓名/电话冗余到 `members.name/phone`。

---

## 4. 健康评估与建档

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 会员列表（健档索引） | GET | `/api/v1/staff/members` | `health:view` | 健康档案会员分页 |
| 会员健康档案详情 | GET | `/api/v1/staff/members/:id/health-profile` | `health:view` | 档案聚合 |
| 档案指标录入 | POST | `/api/v1/staff/members/:id/health-records` | `health:record` | 手动录入体检值 |
| 建档 | POST | `/api/v1/staff/members` | `health:profile` | 新建会员健康档案 |
| 评估列表 | GET | `/api/v1/staff/members/:id/assessments` | `health:assess` | 会员评估历史 |
| 评估详情 | GET | `/api/v1/staff/assessments/:id` | `health:assess` | 含问卷/答案/分级 |
| 发起评估 | POST | `/api/v1/staff/members/:id/assessments` | `health:assess` | 发起（初次/定期/专项） |
| 评估完成（确认） | POST | `/api/v1/staff/assessments/:id/confirm` | `health:assess` | 确认并落等级 |

### 4.1 会员列表（建档索引）
GET `/api/v1/staff/members?keyword=&risk_level=&care_level=&institution_id=&page=&page_size=`
> 输出会员简档 + 当前风险/照护等级（从 `risk_level_changes` 最新记录取）。
**出参 data：**
```json
{ "list": [{
  "id": 1, "name": "王阿姨", "gender": 2, "birthday": "1955-08-20",
  "phone": "138****0000", "nursing_home_id": 1, "station_id": null,
  "status": 2,
  "risk_level": {"level_type":1,"level_value":2,"level_name":"较高风险","prev_level_value":3},
  "care_level": {"level_type":2,"level_value":3,"level_name":"轻度失能","prev_level_value":4},
  "chronic_disease_count": 2, "assessment_count": 3, "last_assessment_time": 1755500000
}], "total": 86, "page": 1, "page_size": 10 }
```

### 4.2 会员健康档案详情
GET `/api/v1/staff/members/:id/health-profile`
**出参 data（聚合）：**
```json
{
  "member": { "id":1,"name":"王阿姨","gender":2,"birthday":"1955-08-20","status":2 },
  "contact": { "emergency_contact":"李女士","emergency_phone":"139****0000" },
  "addresses": [{ "id":1,"province":"北京","city":"北京","district":"朝阳","detail_address":"某某小区","is_default":1 }],
  "levels": { "risk_level":2, "care_level":3 },
  "risk_tags": ["跌倒高风险","高血压"],
  "chronic_diseases": [{ "disease_id":1,"disease_name":"高血压","diagnosed_date":"2020-01-01","diagnosis_source":1,"is_active":1 }],
  "latest_metrics": [{ "metric_id":1,"metric_code":"SYS_BP","metric_name_cn":"收缩压","metric_value":150,"metric_unit":"mmHg","measurement_time":1755500000,"is_abnormal":1 }],
  "recent_plans": [{ "id":1,"plan_name":"血压管理方案","status":3 }],
  "recent_goals": [{ "id":1,"goal_name":"血压达标控制","progress":60.0,"status":1 }]
}
```

### 4.3 健康指标录入
POST `/api/v1/staff/members/:id/health-records`
**入参：**
```json
{
  "metrics": [
    { "metric_id":1, "metric_value": 150.00, "measurement_time": 1755500000, "data_source": 3 },
    { "metric_id":2, "metric_value": 95, "measurement_time": 1755500000, "data_source": 3 }
  ]
}
```
**逻辑：** 逐条写 `member_health_records`（`data_source`：1-手动 2-设备 3-评估 4-随访 5-导入），`is_abnormal` 按参考范围（`health_metric_ref_ranges` 按性别/年龄）自动判定。

### 4.4 建档
POST `/api/v1/staff/members`
**入参：** 同 3.7 的 `member` 对象（可选 `member_addresses` 数组）。
**出参 data：** `{ "id": 101, "name": "王阿姨", "status": 1 }`

### 4.5 发起评估
POST `/api/v1/staff/members/:id/assessments`
**入参：**
```json
{
  "assessment_type": 1,               // 1-初次 2-定期 3-专项
  "assessment_name": "长者综合健康评估",
  "ass_questionnaires": [1, 2],       // 对齐 health_assessments.ass_questionnaires（评估问卷ID数组，可空）
  "assessment_time": 1755600000       // 对齐 health_assessments.assessment_time（计划评估时间，可空）
}
```
**逻辑：** 创建 `health_assessments(status=1-draft)`，`assessor_id/name`、`institution_id/name` 从当前登录会话冗余注入。

### 4.6 评估完成/确认
POST `/api/v1/staff/assessments/:id/confirm`
**入参：**
```json
{
  "assessment_time": 1755603600,
  "total_score": 72,
  "severity": 2,                    // 0-健康 1-低 2-中 3-高风险
  "assessed_risk_level": 2,         // 1-红 2-橙 3-黄 4-绿 5-灰
  "assessed_care_level": 3,
  "risk_tags": ["跌倒高风险","高血压控制欠佳"],
  "ass_questionnaires": [1,2],        // 对齐 health_assessments.ass_questionnaires
  "ass_answers": [11,22,33],          // 对齐 health_assessments.ass_answers（评估问卷答案ID数组）
  "assessment_data": { },           // 评估明细 JSON
  "conclusion": "整体情况中等...",
  "suggestion": { "advice": "随访建议" }
}
```
**逻辑（原子）**：① `health_assessments` status→2-confirmed；② 写入 `risk_level_changes`（level_type=1/2 各一条，prev 取当前最新，`change_source=1-健康评估`）；③ 依据新风险等级从 `risk_level_dict` 读 `followup_cycle_days` 自动生成 `health_followups(source_type=3-评估, status=1-planned)`。

---

## 5. AI 健康方案生成与健康目标

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 健康方案列表 | GET | `/api/v1/staff/members/:id/plans` | `health:plan` | 会员方案分页 |
| 生成方案（AI） | POST | `/api/v1/staff/members/:id/plans/ai-generate` | `health:plan-ai` | AI 生成并草稿 |
| 方案详情 | GET | `/api/v1/staff/plans/:id` | `health:plan` | |
| 方案确认 | POST | `/api/v1/staff/plans/:id/confirm` | `health:plan` | 3-confirmed |
| 方案废弃 | POST | `/api/v1/staff/plans/:id/abandon` | `health:plan` | 9-abandon |
| 健康目标列表 | GET | `/api/v1/staff/members/:id/goals` | `health:goal` | |
| 健康目标新增 | POST | `/api/v1/staff/members/:id/goals` | `health:goal` | 含 goal_items |
| 健康目标更新进度 | POST | `/api/v1/staff/goals/:id/items` | `health:goal` | 更新指标项达成 |

### 5.1 AI 健康方案生成
POST `/api/v1/staff/members/:id/plans/ai-generate`
**入参：** `{ "plan_name": "12 周健康管理方案", "plan_type": 1 }`
> 说明：`health_plans` 表无 `generator` / `engine` 字段，AI 生成参数（模型/引擎）为内部调用细节，不入库，故从入参移除。【库表缺失请确认：如需留存 AI 调用来源，建议未来版本在 `health_plans` 增加 `ai_source` JSON 字段】
**出参 data（草案）：**
```json
{
  "id": 21, "member_id": 1, "plan_name": "12周健康管理方案",
  "plan_type": 1, "duration_days": 84,
  "start_date": "2026-08-25", "end_date": "2026-11-17",
  "plan_content": "## 慢病控制\n- 每周上门随访 1 次...",  // AI 生成内容
  "status": 1, "created_by": 5, "created_by_name": "张护士长"
}
```
> 说明：出参移除 `recommendation` / `ai_recommended_items` —— 二者在 `health_plans` / `health_goals` 表中均无对应列，AI 推荐的目标/指标项落库形式见 §5.3（`health_goals` + `health_goal_items`）。【库表缺失请确认】
> 以 `members.id` 的档案（慢性病、指标、等级）为输入调用 AI；内容落 `health_plans.plan_content`，状态=1-created；人工可编辑后再提交确认。

### 5.2 方案确认
POST `/api/v1/staff/plans/:id/confirm`
**入参：** `{ "confirmed_by": 5, "confirmed_by_name": "张护士长", "edits": { ... } }`
**逻辑：** 可先对 `plan_content` 做人工修订覆盖，再 `status=3-confirmed`；确认后按方案目标生成 `health_goals` 草稿供细化。

### 5.3 健康目标新增
POST `/api/v1/staff/members/:id/goals`
**入参：**
```json
{
  "goal_name": "血压达标控制",
  "goal_type": 1, "start_date": "2026-08-25", "end_date": "2026-11-17",
  "priority": 2, "remark": "",
  "items": [
    { "metric_id": 1, "target_value": 13000, "target_lower": 11000, "target_upper": 14000 },
    { "metric_id": 2, "target_lower": 60, "target_upper": 90 }
  ]
}
```
**出参 data：** `{ "goal_id": 1, "item_ids": [11,12] }`

### 5.4 健康目标指标项更新
POST `/api/v1/staff/goals/:id/items`
**入参：** `{ "items": [ { "id": 11, "actual_value": 13800, "is_met": 0 }, { "id":12,"actual_value":88,"is_met":1 } ] }`
**逻辑：** 更新 `health_goal_items` 达成，服务端重算 `health_goals.progress`（指标项加权）；目标状态自动流转（全部达成→2-已完成）。
> 说明：【库表缺失请确认】`health_goal_items` 表仅含 `target_value / target_lower / target_upper / is_met / latest_record_at`，**没有 `actual_value` 列**。入参 `actual_value` 为瞬时测量值，实际应作为一条 `member_health_records`（`metric_id` + `metric_value`）落库；服务端据参考范围判定 `is_met`（1-已达标/2-未达标/9-未评估）并回填 `health_goal_items.is_met` 与 `latest_record_at`。

---

## 6. 健康预警与随访回访

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 预警列表 | GET | `/api/v1/staff/warnings` | `warn:view` | 分页，按等级/状态/来源 |
| 预警详情 | GET | `/api/v1/staff/warnings/:id` | `warn:view` | |
| 预警处置 | POST | `/api/v1/staff/warnings/:id/handle` | `warn:handle` | 处置并估调等级 |
| 预警忽略 | POST | `/api/v1/staff/warnings/:id/ignore` | `warn:handle` | 忽略 |
| 随访列表 | GET | `/api/v1/staff/followups` | `staff:followup` | 机构随访待办 |
| 随访创建 | POST | `/api/v1/staff/members/:id/followups` | `staff:followup` | 手动创建/分配 |
| 随访完成 | POST | `/api/v1/staff/followups/:id/complete` | `staff:followup` | 记录内容并调级 |

### 6.1 预警列表
GET `/api/v1/staff/warnings?status=1&severity=&warning_source=&member_id=&page=`
**出参 data：** 分页 `health_warnings` 列表字段（`{id, member_id, member_name, title, severity, warning_status, metric_values, created_at}`）。

### 6.2 预警处置
POST `/api/v1/staff/warnings/:id/handle`
**入参：**
```json
{
  "handled_reason": "复查指标恢复正常",
  "adjust_risk_level": 3,     // 可选，调整后健康风险等级
  "adjust_care_level": 4,     // 可选，调整后照护等级
  "note": ""
}
```
**逻辑：** ① `warning_status=2-handled`、`handled_at/by`；② 若调整等级则写 `risk_level_changes(change_source=2-预警处置, source_id=warning.id)`；③ 依新等级重新排 `health_followups` 周期。

### 6.3 随访列表
GET `/api/v1/staff/followups?status=&member_id=&staff_id=&institution_id=&next_followup_date=`
> 仅返回本机构随访；含系统与手动。
**出参 data：**
```json
{ "list": [{
  "id": 1, "member_id": 1, "member_name": "王阿姨",
  "institution_id": 1, "staff_id": null, "source_type": 1, "source_id": null,
  "followup_type": 1, "followup_time": null, "followup_name": null,
  "status": 1, "severity": 2, "next_followup_date": "2026-08-22"
}], "total": 12, "page": 1, "page_size": 10 }
```

### 6.4 手动创建随访
POST `/api/v1/staff/members/:id/followups`
**入参：** `{ "source_type": 9, "source_id": null, "followup_type": 1, "next_followup_date": "2026-08-22", "staff_id": 5 }`
**逻辑：** 建 `status=2-assigned`（指定 staff）或 `1-planned`（未指定）。

### 6.5 随访完成
POST `/api/v1/staff/followups/:id/complete`
**入参：**
```json
{
  "followup_time": 1755607200,
  "followup_content": "电话随访，血压符合 , 无异常",
  "vital_signs": [11,12],     // member_health_records ID 数组
  "risk_flag": ["血压偏高"],
  "severity": 2,
  "suggestions": "建议 14 天后复查",
  "next_followup_date": "2026-09-05",
  "adjust_risk_level": 3,     // 可空，随访中级别调整
  "adjust_care_level": null
}
```
**逻辑：** ① 状态→3-completed、`followup_name/type/time` 落库；② 生命体征写入 `member_health_records`；③ 若调整等级写 `risk_level_changes(change_source=2)`；④ 依 `next_followup_date` 自动生成下一条。

---

## 7. 服务人员管理

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 人员列表 | GET | `/api/v1/staff/staffs` | `staffmgr:view` | 本机构人员分页 |
| 人员详情 | GET | `/api/v1/staff/staffs/:id` | `staffmgr:view` | 含资质/服务分类/排班次数 |
| 新增人员 | POST | `/api/v1/staff/staffs` | `staffmgr:manage` | |
| 编辑人员 | PUT | `/api/v1/staff/staffs/:id` | `staffmgr:manage` | |
| 资质列表 | GET | `/api/v1/staff/staffs/:id/credentials` | `staffmgr:view` | |
| 资质新增 | POST | `/api/v1/staff/staffs/:id/credentials` | `staffmgr:manage` | |
| 资质状态/到期 | PUT | `/api/v1/staff/credentials/:id` | `staffmgr:manage` | |
| 岗位配置列表 | GET | `/api/v1/staff/positions` | `staffmgr:view` | |

### 7.1 人员列表
GET `/api/v1/staff/staffs?staff_type=&status=&position_id=&keyword=&page=`
**出参 data：**
```json
{ "list": [{
  "id": 5, "institution_id": 1, "staff_type": 1, "name": "张护士长", "phone": "138****0000",
  "avatar_url": "...", "position_id": 1, "position_name": "护士长", "title": "主管护师",
  "service_categories": [1,2], "status": 1, "upcoming_credential_expire": true
}], "total": 40, "page": 1, "page_size": 10 }
```

### 7.2 新增/编辑人员
POST `/api/v1/staff/staffs`
**入参：** `{ "institution_id": 1, "staff_type": 1, "name":"李护士", "phone":"13900000000","password":"******", "position_id": 3, "title":"护士", "avatar_url":"...", "service_categories": [3,4], "status": 1 }`
> `phone` 唯一；新增时设定初始密码（首次登录强制改密）。

### 7.3 资质新增
POST `/api/v1/staff/staffs/:id/credentials`
**入参：** `{ "institution_id":1,"cred_type":1,"cred_name":"护士执业证书","cred_no":"123456","issue_org":"卫健委","issue_date":1700000000,"expire_date":1788000000,"cred_url":"..." }`
> 同步更新 `institution_staff.credentials` JSON 冗余；到期前自动置 `status=2-即将到期` 并提醒。

### 7.4 资质更新
PUT `/api/v1/staff/credentials/:id`
**入参：** `{ "status": 1, "expire_date": 1790000000, "cred_url": "..." }`

---

## 8. 排班管理

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 机构排班表 | GET | `/api/v1/staff/schedules` | `schedule:view` | 日/周视图，机构维度 |
| 排班详情 | GET | `/api/v1/staff/schedules/:id` | `schedule:view` | |
| 新增排班 | POST | `/api/v1/staff/schedules` | `schedule:manage` | |
| 编辑排班 | PUT | `/api/v1/staff/schedules/:id` | `schedule:manage` | 含班次调整 |
| 停用/删除排班 | DELETE | `/api/v1/staff/schedules/:id` | `schedule:manage` | 软删 |

### 8.1 机构排班表
GET `/api/v1/staff/schedules?view=day|week|month&date=2026-08-20&staff_id=&institution_id=1`
**出参 data：**
```json
{ "list": [{
  "id": 1, "staff_id": 5, "staff_name": "张护士长", "institution_id": 1,
  "schedule_date": "2026-08-20",
  "shift_type": 1,                // 1-早班 2-中班 3-晚班
  "start_time": "08:00:00", "end_time": "12:00:00",
  "is_rest": 0, "note": "",
  "assign_count": 2, "serve_count": 5
}], "total": 8, "page": 1, "page_size": 10 }
```

### 8.2 新增/编辑排班
POST `/api/v1/staff/schedules`
**入参：** `{ "staff_id":5,"institution_id":1,"schedule_date":"2026-08-20","shift_type":1,"start_time":"08:00:00","end_time":"12:00:00","is_rest":0,"note":"" }`
> 唯一约束 `uk_staff_date_shift (staff_id, schedule_date, shift_type)`：**同一人员同一天同班次只允许一条**，重复返回 `6001-业务冲突`。

---

## 9. 服务订单确认与排单派单

### 9.0 待确定订单确认
> 上门服务订单用户完成支付后进入 `待确定(2)`，需医护/机构在此确认安排后才进入 `生效中(3)`，工单方可派单。联动业务：仅 `生效中` 订单的工单可派单（详见 9.3）。

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 待确定订单列表 | GET | `/api/v1/staff/orders/pending-confirm` | `order:view` | 分页，`order_status=2 待确定` |
| 订单详情 | GET | `/api/v1/staff/orders/:id` | `order:view` | 含服务/耗材/工单 |
| **订单确认** | POST | `/api/v1/staff/orders/:id/confirm` | `order:manage` | **待确定(2)→生效中(3)** |
| 订单关闭/拒绝 | POST | `/api/v1/staff/orders/:id/reject` | `order:manage` | 关联取消并退款说明 |

**订单确认：**
POST `/api/v1/staff/orders/:id/confirm`
**入参：** `{ "assigned_staff_id": 12, "remark": "已电联确认安排" }`（可选指定承接人员）
**逻辑：** ① 校验 `order_status=2 待确定`；② 更新 `service_orders.order_status=3 生效中`，写入 `confirmed_at/confirmed_by`；③ 关联 `work_orders` 进入可派单（`wo_status` 保持待派单）；④ 记 `staff_operation_logs`。（用户款项已收，确认后即履约）

---

### 9.1 排单派单与工单管理

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 工单列表 | GET | `/api/v1/staff/work-orders` | `wo:view` | 分页，按状态/时间/人员 |
| 工单详情 | GET | `/api/v1/staff/work-orders/:id` | `wo:view` | 含排单与服务留痕 |
| 待排单队列 | GET | `/api/v1/staff/work-orders/pending-dispatch` | `wo:dispatch` | 1-待排单 |
| 派单 | POST | `/api/v1/staff/work-orders/:id/dispatch` | `wo:dispatch` | 创建排单 |
| 改派 | POST | `/api/v1/staff/service-schedules/:id/reassign` | `wo:dispatch` | 更换服务人员 |
| 催单 | POST | `/api/v1/staff/work-orders/:id/reminder` | `wo:dispatch` | 发催办消息 |
| 取消排单 | POST | `/api/v1/staff/service-schedules/:id/cancel` | `wo:dispatch` | 4-已取消 |

### 9.2 工单列表
GET `/api/v1/staff/work-orders?wo_status=&staff_id=&service_date=&member_id=&keyword=&page=`
**出参 data：**
```json
{ "list": [{
  "id": 1, "order_id": 88, "member_id": 1, "member_name": "王阿姨", "member_phone": "138****0000",
  "contact_name": "李女士", "contact_phone": "139****0000",
  "service_address": "北京市朝阳区某某小区",
  "expected_start_at": 1755600000, "expected_stop_at": 1755607200,
  "wo_status": 1, "schedule_id": null, "assigned_at": null,
  "expect_staff": 101, "expect_staff_name": "张护士长",  // 期望医护（下单时所填，派单决策参考）
  "remark": "",                                          // 订单备注（work_orders.remark）
  "service_name": "居家护理", "category": 1
}], "total": 30, "page": 1, "page_size": 10 }
```

### 9.3 派单
POST `/api/v1/staff/work-orders/:id/dispatch`
**入参：**
```json
{
  "assigned_staff_id": 12,
  "service_date": "2026-08-20",
  "planned_start_at": 1755600000, "planned_stop_at": 1755607200,
  "remark": ""
}
```
**逻辑：** ① 校验工单 `wo_status=1/2`、服务人员 `staff_type=2` 且所在机构匹配；② 创建 `service_schedules`（`schedule_no` 服务端生成，唯一；`schedule_status=2-已派单`）；③ 反填 `work_orders.schedule_id/assigned_at`，`wo_status` 保持待接单（`1→2` 由小程序接单流转）；④ 写入 `staff_operation_logs(action_type=2)`。

### 9.4 改派
POST `/api/v1/staff/service-schedules/:id/reassign`
**入参：** `{ "new_staff_id": 13, "reason": "原护士临时请假", "planned_start_at": 1755603600, "planned_stop_at": 1755610800 }`
**逻辑：** ① 校验原排单 `schedule_status≠4`；② 更新 `assigned_staff_id`（必要时 `work_orders.assigned_at`）；③ 记`staff_operation_logs`。

### 9.5 催单
POST `/api/v1/staff/work-orders/:id/reminder`
**入参：** `{ "via": "sms", "content": "请尽快前往服务" }`
**逻辑：** 向 `service_schedules.assigned_staff_id` 手机号发送催办通知（走消息/短信域），记 `staff_operation_logs(action_type=1)`。

### 9.6 取消排单
POST `/api/v1/staff/service-schedules/:id/cancel`
**入参：** `{ "reason": "会员行程变更" }`
> 仅允许取消 `schedule_status=2/3`；取消后 `work_orders.schedule_id` 置空，工单回到待排单（`wo_status=1` 或确认取消）。

---

## 10. 预约咨询与到院登记

| 接口 | 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|------|
| 预约列表 | GET | `/api/v1/staff/appointments` | `appt:view` | 分页 |
| 预约详情 | GET | `/api/v1/staff/appointments/:id` | `appt:view` | |
| 预约确认 | POST | `/api/v1/staff/appointments/:id/confirm` | `appt:manage` | 2-confirmed |
| 预约取消 | POST | `/api/v1/staff/appointments/:id/cancel` | `appt:manage` | 6-cancelled |
| 指派接待人 | POST | `/api/v1/staff/appointments/:id/assign` | `appt:manage` | |
| 到院登记 | POST | `/api/v1/staff/appointments/:id/checkin` | `appt:manage` | 到院签 (3-arrived) |
| 咨询记录列表 | GET | `/api/v1/staff/consultations` | `consult:view` | AI/人工 |
| 人工回复 | POST | `/api/v1/staff/consultations/:id/reply` | `consult:reply` | |

### 10.1 预约列表与确认
GET `/api/v1/staff/appointments?status=&appointment_date=&appointment_type=&keyword=`
**出参 data：**
```json
{ "list": [{
  "id": 1, "member_id": 1, "member_name": "王阿姨", "user_id": 12,
  "institution_id": 1, "appointment_type": 4,
  "appointment_date": "2026-08-22", "time_slot": "09:00-12:00",
  "contact_name": "李女士", "contact_phone": "139****0000", "service_interest": "康复护理",
  "assigned_staff_id": 5, "assigned_staff_name": "张护士长", "status": 2, "remark": ""
}], "total": 9, "page": 1, "page_size": 10 }
```
POST `/api/v1/staff/appointments/:id/confirm`：入参 `{ "assigned_staff_id": 5, "remark": "已电联" }` → `status=2`、`confirmed_at`。

### 10.2 指派接待人 / 取消预约
POST `/api/v1/staff/appointments/:id/assign`：`{ "assigned_staff_id": 6 }`（同步冗余 `assigned_staff_name`）。
POST `/api/v1/staff/appointments/:id/cancel`：`{ "reason": "会员临时有事" }` → `status=6-cancelled`。

### 10.3 到院登记
POST `/api/v1/staff/appointments/:id/checkin`
**入参：** `{ "arrived_at": 1755612000 }`（默认当前时间）
**逻辑：** `status=3-arrived`、`arrived_at`；到院后引导完成健康评估（可选 `create_assessment=true` 触发 `health_assessments`），并可转化为线索/建档。

### 10.4 咨询记录与人工回复
GET `/api/v1/staff/consultations?status=1&institution_id=1`
**出参：** 返回 `{id, member_id, consultation_type, question, answer, responder_name, status, created_at}`。
POST `/api/v1/staff/consultations/:id/reply`
**入参：** `{ "answer": "您可预约下周一到院做评估" }`，服务端注入 `responder_id/responder_name`，`status=2-replied`。

---

## 11. 结语与数据库补充建议

### 11.1 模块与接口覆盖
协同工作台端共覆盖 **11 大模块、70 个接口**（认证、首页、线索、健康评估建档、AI 方案与目标、随访回访与预警、服务人员、排班、排单派单与工单、预约咨询与到院登记）。与运营后台端（`/api/v1/admin`）、医护小程序端（`/api/v1/sminiapp`）职责互补，不重复承载订单支付、内容运营、上门签到留痕等能力。

### 11.2 与 DB v1.10 一致性核验口径
1. **纯字段直写**：衔接的 `institution_staff / staff_positions / staff_schedules / staff_credentials / leads / members / member_addresses / health_assessments / health_followups / health_warnings / health_plans / health_goals / health_goal_items / risk_level_changes / work_orders / service_schedules / service_records / order_evidence / appointments / consultations` 均直接映射 DB v1.10 字段名（含 `风险等级双标`、`risk_level_dict`、`health_metric_dicts`、`health_metric_ref_ranges` 等引用表）。
2. **枚举语义对齐**：所有 TINYINT 状态码（工单 `wo_status`、排单 `schedule_status`、线索 `status`、评估/方案/目标/随访/预警状态等）严格采用本文 `§0.6` 与 DB 注释一致的定义，未新增枚举。
3. **主键/外键约束**：逻辑外键（`member_id/staff_id/institution_id/assigned_staff_id`）均保持 v1.10 表间关系，无新增物理约束。
4. **双标等级来源**：会员当前健康/照护等级不落 `members` 冗余列（v1.9 无该字段），一律以 `risk_level_changes` 最新记录为准（`idx_member_level_created` 组合索引）；评估/预警/随访调整均写 `change_source`。
5. **备注**：`risk_followup_config` 独立配置表在 v1.9 中不建，随访周期统一读取 `risk_level_dict.followup_cycle_days`（与运营后台 §12 一致）。

### 11.3 数据库补充建议（供后续版本考量，非必须）
| 领域 | 建议 | 说明 |
|------|------|------|
| 我的工作台聚合 | 建物化视图 `staff_ws_overview`（可选） | 今日待办多表聚合，避免首页多次扫表 |
| 排班与派单衔接 | `service_schedules` 增加 `conflict_check` 建议 | 通过入参校验而非加字段，避免破坏唯一约束 |
| 权限埋点 | 建议 `permissions` 为 `staff:` 前缀补齐按机构维度巡检脚本 | 便于运维审计 |
| 消息提醒 | 复用系统域 `messages`/`message_templates`，不建议新建表 | 催单/预警通知统一走消息域 |

> 上述补充均为可选优化：涉及新表/新字段处建议在后续数据库版本统一评审。本次数据库 v1.10（2026-08-23）仅补充了 `service_records.service_consumables`（工单耗材实耗留痕），未纳入上表建议；当前协同工作台 v0.1 完全兼容 DB v1.10。
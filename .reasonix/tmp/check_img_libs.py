import importlib
for name in ['PIL', 'pytesseract', 'cv2', 'numpy']:
    try:
        mod = importlib.import_module(name)
        print(name, 'OK', getattr(mod, '__version__', ''))
    except Exception as e:
        print(name, 'FAIL', e)

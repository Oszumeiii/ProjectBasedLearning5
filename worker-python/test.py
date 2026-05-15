import torch

if torch.cuda.is_available():
    print(f"✅ Đã nhận GPU: {torch.cuda.get_device_name(0)}")
else:
    print("❌ Vẫn chưa nhận được GPU. Hãy kiểm tra lại driver NVIDIA.")
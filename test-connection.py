import socket

print("测试服务器连接...")

try:
    # 测试服务器是否可以连接
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2)
    result = s.connect_ex(('localhost', 3001))
    
    if result == 0:
        print("✅ 服务器连接成功")
    else:
        print("❌ 服务器连接失败")
    
    s.close()
    
except Exception as e:
    print(f"❌ 连接错误: {e}")

print("测试完成")
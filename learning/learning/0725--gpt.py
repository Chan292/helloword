import datetime

def fish_or_sun(day):
    start_date = datetime.date(1990, 1, 1)
    target_date = datetime.datetime.strptime(day, "%Y-%m-%d").date()
    total_days = (target_date - start_date).days

    if (total_days // 5) % 2 == 0:
        return "打鱼"
    else:
        return "晒网"

# 用户输入日期
date_str = input("请输入日期（格式：YYYY-MM-DD）：")
result = fish_or_sun(date_str)
print(f"在 {date_str} 这一天，这个人是：{result}")
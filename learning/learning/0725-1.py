#coding=utf-8
import datetime

#6.某人从1990年1月1日开始三天打鱼两天晒网，问这个人在以后的某一天中是大于还是晒网
def fish_or_sun(day):
    start_date = datetime.datetime(1990, 1, 1)                  #从这个日期开始
    input_date = datetime.datetime.strptime(day, "%Y-%m-%d")    #我输入的日期信息
    apart_days = (input_date - start_date).days                 #计算两个日期的差值

    if apart_days % 5 == 0 or apart_days % 5 == 4:
        return '晒网'
    else:
        return '打鱼'

#请输入日期
date = input("请输入日期 (格式:YYYY-MM-DD) : ")
# input_date=datetime.datetime.strptime(date, "%Y-%m-%d")
# dating=input_date.strftime('%y-%m-%d')
result=fish_or_sun(date)
print(f'{date}这天，这个人在{result}')






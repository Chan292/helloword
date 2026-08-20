#coding=utf-8

import random

class Mynumbers:
    num5=random.sample(range(1,50),5)
    print(f'5个数是:{num5}')
    num6=random.sample(range(1,50),6)
    print(f'6个数是:{num6}')
    num2=random.sample(range(1,50),2)
    print(f'2个数是:{num2}')
    num1=random.sample(range(1,50),1)
    print(f'1个数是:{num1}')
num=Mynumbers()

class fengefu:
    def ge(self):
        aa= '----------'
        return aa
fen=fengefu()

sex='male'
name='sherry'

# print('{0}')

#最基础的1
def hello():
    print('1. ','Hello world')
hello()
print(fen.ge())
#比大小
def compare(a1,b1):
    if a1>b1:
        return a1
    if a1<b1:
        return b1
    else:
        print('这两个数相等')
a1 = num.num1[0]
print(num.num1)
b1 = num.num2[0]
print(f'2. a={a1},b={b1}','更小的数是',min(a1,b1))
print(fen.ge())
#加减法
def addition(a2,b2):
    return a2+b2
c=num.num1[0]
d=num.num2[1]
z=addition(c,d)
print('3.  算法的答案是',z)
print(fen.ge())
#计算面积
def area(weith,height):
    return  weith*height
w=5
h=5
print('4. ','高是',w,';长是',h,'h;面积是',area(w,h))
print(fen.ge())
#定义函数
def askname(name):
    print(f'hey,{name}')
    return
askname('Sherry')
# hanshu('这是第二句')
print(fen.ge())
#可变对象
def change(list):
    list.append(num.num2)
    print('内函数取值',list)
    return
list=num.num5
print('外函数取值',list)
change(list)
print(fen.ge())
#可写函数
def nameageinfo(name,age):
    '记录输入的所有字符串'
    print('5. ','输入的姓名是',name,';','输入的年龄是',age,';')
    return
nameageinfo(name='chen',age=25)
print(fen.ge())
def dizengnum():
    nums1=num.num6
    # nums1=[1,2,3,4]
    sum=0
    for i in nums1:
        sum += i
    return sum
sum1=dizengnum()
#递乘函数
def dichengnum():
    nums2=num.num6
    sum=1
    for i1 in nums2:
        sum*=i1
    return sum
sum2=dichengnum()
print('6. ','一号递增函数的结果是:',sum1,';','二号递乘函数的结果是:',sum2)
print(fen.ge())


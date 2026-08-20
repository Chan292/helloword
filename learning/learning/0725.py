#coding=utf-8

#1.车牌搜寻
# 卡车违反交通规则，撞人后逃跑。现场有三人目击该事件，但都没有记住车号，
# 只记下了车号的一些特征。甲说:牌照的前两位数字是相同的; 乙说:牌照的后两位数字是相同的，
# 但与前两位不同; 丙是数学家，他说: 4位的车号刚好是一 个整数的平方。请根据以上线索求出车号。
min_r=float("inf")
max_r=float("-inf")
for i in range (32,99):             # i=开方数
    for a in range (1,9):           # a=前两个数
        for b in range (1,9):       # b=后两个数
            if (a*1000+a*100+b*10+b == i*i) and (a != b):   #上面提供的信息比较
                print( f'{a}{a}{b}{b}')
                break
        else:
            continue
        break
    else:
        continue

    # 打印i*i的搜索范围
    if i*i < min_r:
        min_r = i*i
    if i*i > max_r:
        max_r = i*i
# else:
#     if min_r != float('inf') and max_r != float('-inf'):
#         print(f'在{min_r}-{max_r}之间没有满足条件的数')
print('————————')

#2.有对兔子，从出生后的第3个月起每个月都生一对兔子。 小兔子长到第3个月后每个月又生一对兔子，
# 假设所有的兔子都不死，问30个月内每个月的兔子总对数为多少?
#  1. A->A1  ; 2. A->A2 (A1=1) ; 3. A->A3 (A1=2,A2=1) ; 4. A->A4,A1->B1 (A2=2,A3=1)
#  5. A->A5,A1->B2,A2->C2 (A3=2,A4=1,B1=1) 6. A->A6,A1->B3,A2->C3,A3->D3 (A4=2,B1=2,)
def count_tuzi (mons):
    if mons == 1 or mons == 2:
        return 1
    else:
        return count_tuzi(mons-1) + count_tuzi(mons-2)
all_tuzi=count_tuzi(20)
print(f'兔子总数量是{all_tuzi}')
print('——————————')
# 3.一只公鸡值五钱，一只母鸡值三钱，三只小鸡值一钱，现在用百钱买百鸡，问公鸡母鸡小鸡各多少只
# a=公鸡，b=母鸡，c=小鸡
def jishu():
    for a in range (0,20):              #公鸡最多20只
        for b in range (0,33):          #母鸡最多33只
            for c in range (0,100):     #小鸡最多100只
                if (a+b+c==100) & (5*a+3*b+c/3==150): #前一个是算只数，后一个是算总钱数
                    return a,b,c
a,b,c=jishu()
print(f'公鸡{a}只 母鸡{b}只 小鸡{c}只')
print('——————————')
# 4.小明有5本书，借给A、B、C、D四个人，每人只能借一本，则可以有多少种解法
i=0
for a in range (1,5):
    for b in range (1,5):
        for c in range (1,5):
            for d in range (1,5):
                if (a!=b) and (a!=c) and (a!=d) and (b!=c) and (b!=d) and (c!=d):
                    print(f'A借阅了{a},B借阅了{b},C借阅了{c},D借阅了{d}')
                    i=i+1
                    if i%4==0:
                        print()
print(f'共有{i}种借阅方案')
print('——————————')








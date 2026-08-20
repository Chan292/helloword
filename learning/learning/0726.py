#coding=utf-8

# 1.一个人赶着鸭子去每个村庄卖，每经过一个村子卖去所赶鸭子的一半又一只。
# 这样他经过了七个村子后还剩两只鸭子，问他出发时共赶多少只鸭子？经过每个村子卖出多少只鸭子？
def duck(n):
    if n==7:
        return 2
    else:
        return (duck(n+1)+1)*2

print(f'鸭子的总数是:{duck(0)}')
count=duck(0)
for i in range(1,8):
    print(f'第{i}个村卖出{count-duck(i)},剩余鸭子数是{duck(i)}')
    count=duck(i)
print('————————————')


# 2.角谷定理。输入一个自然数，若为偶数，则把它除以2，若为奇数，则把它乘以3加1。
# 经过如此有限次运算后，总可以得到自然数值1。求经过多少次可得到自然数1。
def gujiao(n,count,values):
    n=int(n)
    values.append(n)
    if n==1:
        return count,values
    elif n % 2 == 0:
        return gujiao(n/2,count+1,values)
    elif n % 2 != 0:
        return gujiao(n*3+1,count+1,values)

n=input('请输入一个数:')
count,values=gujiao(n,0,[])
print(f'{n},经过{count}次后，得到自然数1')
print('变化的值:',values)

print('————————————')
# 3.日本著名数学游戏专家中村义作教授提出这样一个问题：父亲将2520个桔子分给六个儿子。
# 分完 后父亲说：“老大将分给你的桔子的1/8给老二；老二拿到后连同原先的桔子分1/7给老三；
# 老三拿到后连同原先的桔子分1/6给老四；老四拿到后连同原先的桔子分1/5给老五；
# 老五拿到后连同原先的桔子分1/4给老六；老六拿到后连同原先的桔子分1/3给老大”。
# 结果大家手中的桔子正好一样多。问六兄弟原来手中各有多少桔子？
def fenguzi():
    for a in range(1,1500):
        for b in range(1,1500):
            for c in range(1,1500):
                for d in range(1,1500):
                    for e in range(1,1500):
                        for f in range (1,1500):
                            A = (1-1/8)*a , B =1/8*a+b  # 分别交换前的数量
                            if ( a*(1-(1/8)) == (a*(1/8)+b)*(1-1/7) == (b*1/7+c)*() ):




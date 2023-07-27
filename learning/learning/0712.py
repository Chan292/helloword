#coding=utf-8

import random as ra

area_x = [0,10]
area_y = [0,10]

#这是乌龟的
class Turtle:
    def __init__(self):
        #初始体力
        self.power=100
        #初始随机位置
        # self.x=ra.randint(area_x[0],area_x[1])
        # self.y=ra.randint(area_y[0],area_y[1])
        self.x=ra.randint(0,10)
        self.y=ra.randint(0,10)

    def move(self):
        #计算方向并移动
        new_x=self.x + ra.choice([1,2,-1,-2])
        new_y=self.y + ra.choice([1,2,-1,-2])

        #检查x是否出界了
        if new_x < area_x[0]:
            self.x = area_x[0]-(new_x-area_x[0])
        elif new_x > area_x[1]:
            self.x = area_x[1]-(new_x-area_x[1])
        else:
            self.x = area_x

        #检查y是否出界了
        if new_y < area_y[0]:
            self.y = area_y[0]-(new_y-area_y[0])
        elif new_y > area_y[1]:
            self.y = area_y[1]-(new_y-area_y[1])
        else:
            self.y = area_y

        #乌龟消耗体能
        self.power -= 1

        #记录新位置
        return self.x,self.y

    def eat(self):
        self.power += 20
        if self.power > 100:
            self.power = 100

#这是鱼的
class Fish:
    def __init__(self):
        # self.x = ra.randint(area_x[0],area_x[1])
        # self.y = ra.randint(area_y[0],area_y[1])
        self.x = ra.randint(0, 10)
        self.y = ra.randint(0, 10)

    def move(self):
        #随机移动
        new_x=self.x + ra.choice([1,-1])
        new_y=self.y + ra.choice([1,-1])
        #检查x轴出界
        if new_x < area_x[0]:
            self.x = area_x[0]-(new_x-area_x[0])
        elif new_x > area_x[1]:
            self.x = area_x[1]-(new_x-area_x[1])
        else:
            self.x = new_x
        #检查y轴出界
        if new_y < area_y[0]:
            self.x = area_y[0]-(new_y-area_y[0])
        elif new_y > area_y[1]:
            self.x = area_y[1]-(new_y-area_y[1])
        else:
            self.x = new_y
        #记录位置
        return self.x,self.y

turtle=Turtle()
fish=[]
for i in range(10):
    new_fish=Fish()
    fish.append(new_fish)

while True:
    if not len(fish):
        print('鱼吃完了 游戏结束')
        break
    if not turtle.power:
        print('乌龟没体力了 游戏结束')
        break

    pos=turtle.move()

    for each_fish in fish[:]:
        if each_fish.move() == pos:
            #乌龟吃鱼了
            turtle.eat()
            fish.remove(each_fish)
            print('有一条鱼被吃了')








#coding=utf-8

#类定义
#这个是父定义
class people:
    name=''
    age=''
    weight=''
    def __init__(self,n,a,w):
        self.name=n
        self.age=a
        self.weight=w
    def speak(self):
        print('%s说：我%d岁.'%(self.name,self.age))

#这是子类继承
class xuesheng(people):
    grade=''
    def __init__(self,n,a,w,g):
        #调用父类
        people.__init__(self,n,a,w)
        self.grade=g

    #覆写父类
    def speak(self):
        print('%s说:我%d岁了,我在读%d年级'%(self.name,self.age,self.grade))

s=xuesheng('cong',10,20,30)
s.speak()



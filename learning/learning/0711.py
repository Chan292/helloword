#coding=utf-8

#假设,游乐园门票：
# 正常100
# 周末120%
# 小孩50%
# 军人75%
# 老人免费
# 周末,一共去了6大 2小 1军 2老 问：多少钱

class Ticket_price():
    def __init__(self,weekend=False,child=False,army=False,old=False):
        self.adult=100
        if weekend:
            self.week=1.2
        else:
            self.week=1
        if child:
            self.ch=0.5
        else:
            self.ch=1
        if army:
            self.ar=0.75
        else:
            self.ar=1
        if old:
            self.ol=0
        else:
            self.ol=1
    def price(self,num):
        return self.adult * self.week * self.ch * self.ar * self.ol * num
#工作日价格
workday=Ticket_price()
word_child=Ticket_price(child=True)
work_army=Ticket_price(army=True)
#周末价格
weekend=Ticket_price(weekend=True)
week_child=Ticket_price(weekend=True,child=True)
week_army=Ticket_price(army=True)
old=Ticket_price(old=True)

print('6大:',(weekend.price(6)))
print('2小:',week_child.price(2))
print('总价是:%.2f'% (weekend.price(6)+week_child.price(2)+week_army.price(1)+old.price(2)))
# print('总价是:'+weekend.price(6)+week_child.price(2)+week_army.price(1)+old.price(2))




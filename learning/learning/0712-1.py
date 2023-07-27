import random


class Turtle:
    def __init__(self):
        self.power = 100
        self.x = random.randint(0, 10)
        self.y = random.randint(0, 10)

    def move(self):
        new_x = self.x + random.choice([-2, -1, 1, 2])
        new_y = self.y + random.choice([-2, -1, 1, 2])
        if new_x < 0 or new_x > 10:
            new_x = self.x - (new_x - self.x)
        if new_y < 0 or new_y > 10:
            new_y = self.y - (new_y - self.y)
        self.x = new_x
        self.y = new_y
        self.power -= 1
        return self.x, self.y

    def eat(self):
        self.power += 20
        if self.power > 100:
            self.power = 100


class Fish:
    def __init__(self):
        self.x = random.randint(0, 10)
        self.y = random.randint(0, 10)

    def move(self):
        new_x = self.x + random.choice([-1, 1])
        new_y = self.y + random.choice([-1, 1])
        if new_x < 0 or new_x > 10:
            new_x = self.x - (new_x - self.x)
        if new_y < 0 or new_y > 10:
            new_y = self.y - (new_y - self.y)
        self.x = new_x
        self.y = new_y
        return self.x, self.y


turtle = Turtle()
fishes = [Fish() for _ in range(10)]

while True:
    if turtle.power <= 0 or len(fishes) == 0:
        break

    turtle.move()

    for fish in fishes[:]:
        if fish.x == turtle.x and fish.y == turtle.y:
            turtle.eat()
            fishes.remove(fish)
        else:
            fish.move()

    print("Turtle:", turtle.x, turtle.y, turtle.power)
    print("Fishes:")
    for i, fish in enumerate(fishes):
        print("Fish", i + 1, ":", fish.x, fish.y)

if turtle.power <= 0:
    print("Turtle loses. Game over!")
elif len(fishes) == 0:
    print("Turtle wins. Game over!")
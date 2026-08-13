#leetcode 217
#Дан список чисел nums.
# Верни True, если какое-либо значение встречается хотя бы дважды, иначе верни False.
import re

nums = [5,1,2,3,5]

def num_double():
    nums.sort()
    for i in range(len(nums)):
        if nums[i] == nums[i-1]:
           return True
    return False
print(num_double())


#Дан список чисел nums и целое число target.
#Верни индексы двух чисел, которые в сумме дают target.

nums = [4,33,2, 8,5]
target = 5

def index_sum():
   for i in range(len(nums)):
       for j in range(i+1,len(nums)):
           if nums[i] + nums[j] == target:
               return [i, j]
   else:
       return False
print(index_sum())

#Дана строка s. Верни True, если она является палиндромом
#(читается одинаково слева направо и справа налево), игнорируя пробелы,
#знаки препинания и регистр.

s = '12  32  1 , ,./././.,./.'

def palindrome(s):
    s = s.lower()
    m = re.sub(r'[^a-z0-9]', '',s)
    if m == m[::-1]:
        return True
    else:
        return False

print(palindrome(s))

# #Напиши функцию fizz_buzz(n), которая возвращает список строк от 1 до n, но:
#
# Для чисел, кратных 3, вместо числа выводи "Fizz"
#
# Для чисел, кратных 5, вместо числа выводи "Buzz"
#
# Для чисел, кратных 3 и 5 одновременно, выводи "FizzBuzz"

def fizz_buzz(n):
    s = []
    for i in range(1, n + 1):
        if i % 3 == 0 and i % 5 == 0:
            s.append("FizzBuzz")
        elif i % 5 == 0:
            s.append("Buzz")
        elif i % 3 == 0:
            s.append("Fizz")
        else:
            s.append(str(i))
    return s

print(fizz_buzz(10))

# #Дана строка s, содержащая только символы: '(', ')', '{', '}', '[', ']'.
# Определи, является ли строка корректной (валидной).
#
# Условия валидности:
#
# Открывающая скобка должна закрываться такой же закрывающей скобкой.
#
# Скобки должны закрываться в правильном порядке (вложенность).


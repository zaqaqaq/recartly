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





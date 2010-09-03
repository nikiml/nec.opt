import operator
import random 

def min_index(seq):
  res = 0
  for i in xrange(len(seq)):
    if seq[i]<seq[res]:
      res = i
  return res

def max_index(seq):
  res = 0
  for i in xrange(len(seq)):
    if seq[i]>seq[res]:
      res = i
  return res

def mean_value(seq):
  res = seq[0]
  for i in xrange(1, len(seq)):
    res = res+seq[i]
  return res / len(seq)

def min_value(seq):
  return seq[min_index(seq)]

def max_value(seq):
  return seq[max_index(seq)]

def random_double(size):
  res = size*[.0]
  for i in range(size):
    res[i] = random.random()
  return res

def sort_permutation(seq):
  tmp = zip(seq,xrange(len(seq)))
  s = sorted(tmp, lambda x,y: cmp(x[0],y[0]))
  res = []
  for i in s: res.append(i[1])
  return res

def apply_permutation(seq, permut):
  res = []
  for i in permut: res.append(seq[i])
  return res

def averageArrays(arrays):
  N = len(arrays[0])
  res = reduce(lambda x,y : map(operator.add, x,y), arrays,[0.0]*N)
  return list(map(lambda x: x/N, res))

def linearCombine( c1, a1, c2, a2):
  return list( map ( lambda x,y: c1*x+c2*y , a1,a2))
   

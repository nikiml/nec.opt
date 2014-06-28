from __future__ import division
import operator
import random 
import math

def min_index(seq):
  res = 0
  for i in range(len(seq)):
    if seq[i]<seq[res]:
      res = i
  return res

def max_index(seq):
  res = 0
  for i in range(len(seq)):
    if seq[i]>seq[res]:
      res = i
  return res

def mean_value(seq):
  res = seq[0]
  for i in range(1, len(seq)):
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
  tmp = zip(seq,range(len(seq)))
  s = sorted(tmp)
  res = []
  for i in s: res.append(i[1])
  return res

def apply_permutation(seq, permut):
  res = []
  for i in permut: res.append(seq[i])
  return res

def averageArrays(arrays):
  N = len(arrays[0])
  res = [0.0]*N
  for arr in arrays:
    for i in range(N):
      res[i]+=arr[i]
  return list(map(lambda x: x/N, res))

def linearCombine( c1, a1, c2, a2):
  return list( map ( lambda x,y: c1*x+c2*y , a1,a2))
  

def v3cross(v1, v2):
	return [v1[1]*v2[2]-v1[2]*v2[1], v1[2]*v2[0]-v1[0]*v2[2], v1[0]*v2[1]-v1[1]*v2[0]]

def v3dot(v1, v2):
	return v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2]

def v3add(v1, v2):
	return [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]]

def v3sub(v1, v2):
	return [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]]

def v3neg(v):
	return [-v[0], -v[1], -v[2]]

def v3mul(c, v):
	return [c*v[0], c*v[1], c*v[2]]

def v3len(v):
	return math.sqrt(v3dot(v,v))

def v3unit(v):
	l = v3len(v)
	if l < 1.e-7:
		return [0,0,0]
	return  v3mul(1.0/l, v)

def v3rotAx(angle, coords, axis):
	c = math.cos(angle)
	s = math.sin(angle)
	_1=(axis+1)%3
	_2=(axis+2)%3
	for i in range(int(len(coords)/3)):
		y = coords[3*i+_1]
		z = coords[3*i+_2]
		coords[3*i+_1] = c*y-s*z
		coords[3*i+_2] = s*y+c*z

def v3rotx(angle, coords):
	v3rotAx(angle,coords,0)
def v3roty(angle, coords):
	v3rotAx(angle,coords,1)
def v3rotz(angle, coords):
	v3rotAx(angle,coords,2)


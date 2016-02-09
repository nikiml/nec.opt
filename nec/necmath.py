from __future__ import division
from math import *
PI=pi
Pi=pi
def sgn(a):
	if a < 0: return -1
	if a >0: return 1
	return 0

def select(bool, true, false):
	if bool: return true
	return false

_atan = atan
_atan2 = atan2
_acos = acos
_asin = asin

_tan = tan
_cos = cos
_sin = sin
def sin(a) : return _sin(radians(a))
def cos(a) : return _cos(radians(a))
def tan(a) : return _tan(radians(a))
def asin(x) : return degrees(_asin(x))
def acos(x) : return degrees(_acos(x))
def atan(x) : return degrees(_atan(x))
def atan2(y,x) : return degrees(_atan2(y,x))

atn = atan
def sqr(a) : return sqrt(a)

def normalizeDegree(ang, start = 0):
	while ang < start:
		ang += 360
	end = start+360
	while ang >= end:
		end -=360

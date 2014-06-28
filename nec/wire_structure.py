from __future__ import division
from nec.demathutils import v3add, v3mul, v3sub, v3dot, v3cross, v3len, v3unit, v3rotx, v3roty, v3rotz
from nec import necmath

class GeometryError (RuntimeError):
	def __init__(self, msg):
		RuntimeError.__init__(self,msg)


class WireStructure:
	def __init__(self, options):
		self.options = options
	def testConnectedLines(self, tag1, tag2, line1, line2, r1, r2):
		if line1[0]==line2[0]:
			if line1[1]!=line2[1]:return 1
			else :	raise GeometryError("Overlapping lines (tag %d and tag %d, distance=%f)"%(tag1, tag2, 0))
		if line1[0]==line2[1]:
			if line1[1]!=line2[0]:return 1
			else :	raise GeometryError("Overlapping lines (tag %d and tag %d, distance=%f)"%(tag1, tag2, 0))
		if line1[1]==line2[0]:
			if line1[0]!=line2[1]:return 1
			else :	raise GeometryError("Overlapping lines (tag %d and tag %d, distance=%f)"%(tag1, tag2, 0))
		if line1[1]==line2[1]:
			if line1[0]!=line2[0]:return 1
			else :	raise GeometryError("Overlapping lines (tag %d and tag %d, distance=%f)"%(tag1, tag2, 0))
		return 0

	def lineDir(self, tag, line):
		v = v3sub(line[1],line[0])
		l = v3len(v)
		if not l:
			raise GeometryError("Line with 0 length (tag %d)"%tag)
		return v3mul(1.0/l,v)

	def testLineIntersection(self, tag1, tag2, line1, line2, r1, r2):
		if self.testConnectedLines(tag1, tag2, line1, line2, r1, r2):
			return 1
		v1 = self.lineDir(tag1, line1)
		v2 = self.lineDir(tag2, line2)

		n = v3unit(v3cross(v1,v2))
		if n[0]==0 and n[1]==0 and n[2]==0: #parallel
			v2 = v3sub(line2[1], line1[0])
			d = v3dot(v1,v2)
			pr = v3add(line1[0],v3mul(d, v1))
			pr = v3sub(line2[1],pr)
			pr = v3len(pr)
			if pr>r1+r2+self.options.min_wire_distance:
				return 1

			zerocount = 0
			v2 = v3sub(line2[0], line1[0])
			d = d * v3dot(v1,v2)
			if d < 0 :
				raise GeometryError("Overlapping lines (tag %d and tag %d, distance=%f)"%(tag1, tag2, pr))
			elif d == 0:
				zerocount = zerocount+1
			v2 = v3sub(line2[1], line1[1])
			d = v3dot(v1,v2)
			v2 = v3sub(line2[0], line1[1])
			d = d * v3dot(v1,v2)
			if d < 0 :
				raise GeometryError("Overlapping lines (tag %d and tag %d, distance=%f)"%(tag1, tag2, pr))
			elif d == 0:
				zerocount = zerocount+1

			v2 = v3sub(line1[1], line2[1])
			d = v3dot(v1,v2)
			v2 = v3sub(line1[0], line2[1])
			d = d * v3dot(v1,v2)
			if d < 0 :
				raise GeometryError("Overlapping lines (tag %d and tag %d, distance=%f)"%(tag1, tag2, pr))
			elif d == 0:
				zerocount = zerocount+1


			v2 = v3sub(line1[1], line2[0])
			d = v3dot(v1,v2)
			v2 = v3sub(line1[0], line2[0])
			d = d * v3dot(v1,v2)
			if d < 0 :
				raise GeometryError("Overlapping lines (tag %d and tag %d, distance=%f)"%(tag1, tag2, pr))
			elif d == 0:
				zerocount = zerocount+1

			if zerocount > 2 :
				raise GeometryError("Overlapping lines (tag %d and tag %d, distance=%f)"%(tag1, tag2, pr))

			return 1

		s = v3sub(line1[0], line2[0])
		#print "s  = [%f, %f, %f]"%tuple(s)
		d = v3dot(n, s)
		#print "plane line distance = %f"%d
		if abs(d) > r1+r2 + self.options.min_wire_distance: #infinite lines are far enough
			return 1

		m = v3mul(d, n)
		l20 = v3sub(line2[0],m)
		l21 = v3sub(line2[1],m)
		#line2 and line1 are now in one plane

		c1 = v3cross(v3unit(v3sub(l20,line1[0])),v1)
		#print "c1 = [%f, %f, %f]"%tuple(c1)
		c2 = v3cross(v3unit(v3sub(l21,line1[0])),v1)
		#print "c2 = [%f, %f, %f]"%tuple(c2)
		dot1 = v3dot(c1, n)*v3dot(c2, n)
		c3 = v3cross(v3unit(v3sub(line1[0],l20)),v2)
		#print "c3 = [%f, %f, %f]"%tuple(c3)
		c4 = v3cross(v3unit(v3sub(line1[1],l20)),v2)
		#print "c4 = [%f, %f, %f]"%tuple(c4)
		dot2 = v3dot(c3, n)*v3dot(c4, n)
		#print (dot1, dot2)
		if dot1 < 0 and dot2 < 0:
			raise GeometryError("Intersecting lines (tag %d and tag %d)"%(tag1, tag2))
		return 1
	def testLineIntersections(self, lines):
		nlines= len(lines)
		for i in range(nlines):
			for j in range(i+1,nlines):
				self.testLineIntersection(lines[i][0], lines[j][0], [lines[i][2:5],lines[i][5:8]], [lines[j][2:5],lines[j][5:8]], lines[i][8], lines[i][8])

		return 1

	def mirrorStructure(self, lines,comments, tincr, x,y,z):
		#print "mirroring"
		mirrors = [x,y,z]
		for m in range(3):
			if not mirrors[m]: continue;
			l = len(lines)
			for i in range(l):
				lines.append(list(lines[i]))
				comments.append(comments[i])
				if lines[l+i][0]:
					lines[l+i][0]=lines[i][0]+tincr
					lines[l+i][2+m]=-lines[i][2+m]
					lines[l+i][5+m]=-lines[i][5+m]
			tincr = 2*tincr

	def moveStructure(self, lines, rng, tincr, rx, ry,rz, x,y,z):
		#print "moving %d lines, from %d to %d, incrementing tags with %d"%(rng[1]-rng[0],rng[0],rng[1],tincr)
		rx = necmath.pi*rx/180.0
		ry = necmath.pi*ry/180.0
		rz = necmath.pi*rz/180.0
		for i in range(rng[0], rng[1]):
			if lines[i][0]:
				lines[i][0]+=tincr
			s = lines[i][2:5]
			e = lines[i][5:8]
			if rx:
				v3rotx(rx, s)
				v3rotx(rx, e)
			if ry:
				v3roty(ry, s)
				v3roty(ry, e)
			if rz:
				v3rotz(rz, s)
				v3rotz(rz, e)
			s[0]+=x
			s[1]+=y
			s[2]+=z
			e[0]+=x
			e[1]+=y
			e[2]+=z
			lines[i][2:5]=s
			lines[i][5:8]=e

	def moveCopyStructure(self, lines,comments, tincr, new_structures, rx, ry,rz, x,y,z, from_tag):
		#print "moving %d lines, incrementing tags with %d, starting from tag %d"%(len(lines),tincr, from_tag)
		l = len(lines)
		rng = (0, l)
		if from_tag:
			for i in range(0,l):
				if lines[i][0]==from_tag:
					rng = (i,l)
					break
			if rng == (0,l) and lines[0][0]!=from_tag:
				return

		if not new_structures:
			self.moveStructure(lines, rng, tincr, rx,ry,rz,x,y,z)
			return

		while new_structures:
			new_structures = new_structures-1
			for i in range(rng[0],rng[1]):
				lines.append(list(lines[i]))
				comments.append(comments[i])

			rng = (l,len(lines))
			l = len(lines)
			self.moveStructure(lines, rng, tincr, rx,ry,rz,x,y,z)

	def rotateStructure(self, lines,comments, tincr, nstructures):
		if nstructures<=1:
			return
		self.moveCopyStructure(lines,comments, tincr, nstructures-1, 0, 0,360.0/nstructures, 0,0,0, 0)



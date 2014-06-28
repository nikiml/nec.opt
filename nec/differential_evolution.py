from __future__ import division
'''
extracted from cctbx

cctbx license
---------------------------------
*** License agreement ***

cctbx Copyright (c) 2006, The Regents of the University of
California, through Lawrence Berkeley National Laboratory (subject to
receipt of any required approvals from the U.S. Dept. of Energy).  All
rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

(1) Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.

(2) Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

(3) Neither the name of the University of California, Lawrence Berkeley
National Laboratory, U.S. Dept. of Energy nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

You are under no obligation whatsoever to provide any bug fixes,
patches, or upgrades to the features, functionality or performance of
the source code ("Enhancements") to anyone; however, if you choose to
make your Enhancements available either publicly, or directly to
Lawrence Berkeley National Laboratory, without imposing a separate
written license agreement for such Enhancements, then you hereby grant
the following license: a  non-exclusive, royalty-free perpetual license
to install, use, modify, prepare derivative works, incorporate into
other computer software, distribute, and sublicense such enhancements or
derivative works thereof, in binary and source code form.
'''


#from scitbx.array_family import flex
#from stdlib import random
import random
import operator
from nec.demathutils import *
import sys

  
def applyDeltaAndOffset(seq, delta, offset):
  for i in range(len(seq)):
    seq[i] = seq[i]*delta+offset

class differential_evolution_optimizer(object):
  """
This is a python implementation of differential evolution
It assumes an evaluator class is passed in that has the following
functionality
data members:
 n              :: The number of parameters
 domain         :: a  list [(low,high)]*n
                   with approximate upper and lower limits for each parameter
 x              :: a place holder for a final solution

 also a function called 'target' is needed.
 This function should take a parameter vector as input and return a the function to be minimized.

 The code below was implemented on the basis of the following sources of information:
 1. http://www.icsi.berkeley.edu/~storn/code.html
 2. http://www.daimi.au.dk/~krink/fec05/articles/JV_ComparativeStudy_CEC04.pdf
 3. http://ocw.mit.edu/NR/rdonlyres/Sloan-School-of-Management/15-099Fall2003/A40397B9-E8FB-4B45-A41B-D1F69218901F/0/ses2_storn_price.pdf


 The developers of the differential evolution method have this advice:
 (taken from ref. 1)

 If you are going to optimize your own objective function with DE,
 try the following settings for the input file first: Choose method
 e.g. DE/rand/1/exp, set the number of parents NP to 10 times the
 number of parameters, select weighting factor F=0.8 and crossover
 constant CR=0.9. Make sure that you initialize your parameter vectors
 by exploiting their full numerical range, i.e. if a parameter is allowed
 to exhibit values in the range [-100, 100] it's a good idea to pick the
 initial values from this range instead of unnecessarily restricting diversity.
 If you experience misconvergence you usually have to increase the value for NP,
 but often you only have to adjust F to be a little lower or higher than 0.8.
 If you increase NP and simultaneously lower F a little, convergence is more likely
 to occur but generally takes longer, i.e. DE is getting more robust (there is always
 a convergence speed/robustness tradeoff).

 Note: NP is called population size in the routine below.)
  """

  def __init__(self,
               evaluator,
               population_size=50,
               f=0.8,
               cr=0.9,
               eps=1e-4,
               n_cross=1,
               max_iter=10000,
               monitor_cycle=100,
               out=None,
               show_progress=False,
               show_progress_nth_cycle=1,
               insert_solution_vector=None,
         plugin = None,
	 dither = .0):
    self.show_progress=show_progress
    self.show_progress_nth_cycle=show_progress_nth_cycle
    self.evaluator = evaluator
    self.population_size = population_size
    self.f = f
    self.cr = cr
    self.n_cross = n_cross
    self.max_iter = max_iter
    self.monitor_cycle = monitor_cycle
    self.vector_length = evaluator.n
    self.eps = eps
    self.population = []
    self.seeded = False
    self.plugin = plugin
    self.dither = min(dither, f, 1-f)
    if insert_solution_vector is not None:
      assert len( insert_solution_vector )==self.vector_length
      self.seeded = insert_solution_vector


    self.scores = self.population_size*[1000.0]

  def run(self):	
    self.optimize()
    self.best_score = float(min_value( self.scores ))
    self.best_vector = self.population[ min_index( self.scores ) ]
    self.evaluator.x = self.best_vector
    if self.show_progress:
      self.evaluator.print_status(
            min_value(self.scores),
            mean_value(list(map(float,self.scores))),
            self.population[ min_index( self.scores ) ],
            'Final',0)


  def optimize(self):
    # initialise the population please
    self.make_random_population()
    converged = False
    monitor_score = mean_value(list(map(float,self.scores )))
    count = 0
    while not converged:
      improved = self.evolve()
      self.evaluator.iterationCallback(count, self.population, self.scores, improved)
      location = min_index( self.scores )
      if self.show_progress:
        if count%self.show_progress_nth_cycle==0:
          # make here a call to a custom print_status function in the evaluator function
          # the function signature should be (min_target, mean_target, best vector)
          self.evaluator.print_status(
            min_value(self.scores),
            mean_value(list(map(float,self.scores))),
            self.population[ min_index( self.scores ) ],
            count, improved)

      count += 1
      if count%self.monitor_cycle==0:
        if (monitor_score-mean_value(list(map(float,self.scores))) ) < self.eps:
          converged = True
        else:
         monitor_score = mean_value(list(map(float,self.scores)))
      rd = (mean_value(list(map(float,self.scores))) - float(min_value(self.scores)) )
      rd = rd*rd/(float(min_value(self.scores))*float(min_value(self.scores)) + self.eps*self.eps )
      if ( rd < self.eps*self.eps ):
        converged = True


      if count>=self.max_iter:
        converged =True

  def make_random_population(self):
    self.population,self.scores = self.evaluator.initialPopulation()
    if self.population:
	    self.population_size = len(self.population)
	    self.scores = self.population_size*[1000.0]
	    self.score_population()
	    return
    for ii in range(self.population_size):
      self.population.append( self.vector_length*[0.0] )
    for ii in range(self.vector_length):
      delta  = self.evaluator.domain[ii][1]-self.evaluator.domain[ii][0]
      offset = self.evaluator.domain[ii][0]
      random_values = random_double(self.population_size)
      applyDeltaAndOffset(random_values, delta,offset)
      #random_values = random_values*delta+offset
      # now please place these values ni the proper places in the
      # vectors of the population we generated
      for vector, item in zip(self.population,random_values):
        vector[ii] = item
    if self.seeded is not False:
      self.population[0] = self.seeded
    # score the population please
    self.scores = self.population_size*[1000.]
    self.score_population()

  def score_population(self):
    for vector,ii in zip(self.population,range(self.population_size)):
      tmp_score = self.evaluator.target(vector, ii)
      self.scores[ii]=tmp_score

  def evolve(self):
    new_population=[[]]*self.population_size
    improved = 0
    for ii in range(self.population_size):
      rnd = random_double(self.population_size-1)
      permut = sort_permutation(rnd)
      # make parent indices
      i1=permut[0]
      if (i1>=ii):
        i1+=1
      i2=permut[1]
      if (i2>=ii):
        i2+=1
      i3=permut[2]
      if (i3>=ii):
        i3+=1
      #
      x1 = self.population[ i1 ]
      x2 = self.population[ i2 ]
      x3 = self.population[ i3 ]
      use_f = self.f
      if self.dither!=.0:
	      use_f = use_f+self.dither*(random.random()-.5)
      vi = list(map(operator.add, x1 , map(lambda x: use_f*x, map(operator.sub, x2,x3)))) #v1 = x1 + self.f*(x2-x3)
      # prepare the offspring vector pleaseself.atanhTransform(self.x)
      rnd = random_double(self.vector_length)
      permut = sort_permutation(rnd)
      test_vector = list(self.population[ii]) #self.population[ii].deep_copy()
      # first the parameters that sure cross over
      for jj in range( self.vector_length  ):
        if self.evaluator.enforce_domain_limits:
          if vi[ permut[jj] ] > self.evaluator.domain[ permut[jj] ][1]:
            vi[ permut[jj] ] = (self.evaluator.domain[ permut[jj] ][1]+test_vector[ permut[jj] ])/2
          if vi[ permut[jj] ] < self.evaluator.domain[ permut[jj] ][0]:
            vi[ permut[jj] ] = (self.evaluator.domain[ permut[jj] ][0]+test_vector[ permut[jj] ])/2
        if (jj<self.n_cross):
          test_vector[ permut[jj] ] = vi[ permut[jj] ]
        else:
          if (rnd[jj]<self.cr):
            test_vector[ permut[jj] ] = vi[ permut[jj] ]
      # get the score please
      test_score = self.evaluator.testMemberAgainstScore(test_vector, self.scores[ii],ii)
      #self.evaluator.target( test_vector )
      # check if the score if lower
      if test_score is not None:
        self.scores[ii] = test_score
        new_population[ii] = test_vector
        improved+=1
    for ii in range(self.population_size):
      if new_population[ii]:
        self.population[ii]=new_population[ii]
    if self.plugin:
      res = self.plugin.postEvolve(self)
      if res:
        for r in res:
          self.population[r[0]] = r[1]
          self.scores[r[0]] = r[2]
    self.best_score = float(min_value( self.scores ))
    self.best_vector = self.population[ min_index( self.scores ) ]
    self.evaluator.x = self.best_vector
    return improved


class DESQIPlugin:
  def __init__(self, maxN=3):
    self.maxN = maxN
  
  def postEvolve(self, de):
    b = min_index(de.scores)
    w = max_index(de.scores)
    for k in range(self.maxN):
      rnd = random_double(de.population_size-1)
      permut = sort_permutation(rnd)
      # make parent indices
      i1 = b
      i2=permut[0]
      if (i2>=i1):
        i2+=1
      i3=permut[1]
      if (i3>=i1):
        i3+=1
      test_vector = list(de.population[w])
      x1 = de.population[i1]
      x2 = de.population[i2]
      x3 = de.population[i3]
      f1 = float(de.scores[i1])
      f2 = float(de.scores[i2])
      f3 = float(de.scores[i3])
      for i in range(de.vector_length):
        test_vector[i] = .5*( (x1[i]*x1[i]-x2[i]*x2[i])*f3 + (x2[i]*x2[i] - x3[i]*x3[i])*f1 + (x3[i]*x3[i] - x1[i]*x1[i])*f2) / ( (x1[i]-x2[i])*f1 + (x2[i] - x3[i])*f1 + (x3[i] - x1[i])*f2)
      test_score = de.evaluator.target( test_vector )
      if test_score < de.scores[w]:
        return [(w, test_vector, test_score)]
    return None
    

class SimplexPlugin:
  def __init__(self, rho = 1, chi = 1.5,  psi = 0.5, sigma = 0.5):
    self.rho = rho
    self.chi = chi
    self.psi = psi
    self.sigma = sigma

  def postEvolve(self, de):
    ind = sort_permutation(de.scores)
    de.scores = apply_permutation(de.scores, ind)
    de.population= apply_permutation(de.population, ind)
    res = []

    sim = de.population
    fsim = de.scores
    func = de.evaluator.target
    N = de.vector_length

    rho = self.rho
    chi = self.chi
    psi = self.psi
    sigma = self.sigma

    xbar = averageArrays(apply_permutation(sim, ind)[0:N])

    for i in range(N, de.population_size):
        xr = linearCombine((1+rho),xbar, - rho,sim[ind[i]])
        fxr = func(xr)
        doshrink = 0

        if fxr < fsim[ind[0]]:
            xe = linearCombine((1+rho*chi),xbar, - rho*chi,sim[ind[i]])
            fxe = func(xe)

            if fxe < fxr:
                res.append((ind[i],xe,fxe))
            else:
                res.append((ind[i],xr,fxr))
        else: # fsim[0] <= fxr
            if fxr < fsim[ind[N-1]]:
                res.append((ind[i],xr,fxr))
            else: # fxr >= fsim[-2]
                # Perform contraction
                if fxr < fsim[ind[i]]:
                    xc = linearCombine((1+psi*rho),xbar, - psi*rho,sim[ind[i]])
                    fxc = func(xc)

                    if fxc <= fxr:
                        res.append((ind[i],xc,fxc))
                    else:
                        doshrink=1
                else:
                    # Perform an inside contraction
                    xcc = linearCombine((1-psi),xbar,  psi,sim[ind[i]])
                    fxcc = func(xcc)

                    if fxcc < fsim[ind[i]]:
                        res.append((ind[i],xcc,fxcc))
                    else:
                        doshrink = 1

                if doshrink:
                    xs = linearCombine((1-sigma),sim[ind[0]] , sigma,sim[ind[i]])
                    fxs = func(xs)
                    if fxs < fsim[ind[i]]:
                        res.append((ind[i],xs,fxs))
                    
    return res
       


class test_rosenbrock_function(object):
	def __init__(self, dim=5):
		self.x = None
		self.n = 2*dim
		self.dim = dim
		self.domain = [ (-10,10) ]*self.n
		self.optimizer = differential_evolution_optimizer(self,population_size=self.n*10,n_cross=self.n*2,eps=1e-8, show_progress=True)
		for x in self.x:
			assert abs(x-1.0)<1e-2
	
	
	def target(self, vector):
		tmp = list(vector)
		x_vec = vector[0:self.dim]
		y_vec = vector[self.dim:]
		result=0
		for x,y in zip(x_vec,y_vec):
			result+=100.0*((y-x*x)**2.0) + (1-x)**2.0
		#print list(x_vec), list(y_vec), result
		return result
	
	def print_status(self, mins,means,vector,txt):
		sys.stdout.write("MinScore=%g, MeanScore=%g, Solution = %s\n"%mins, means, str(list(vector)) )
	def initialPopulation(self):
		return [], []
	def iterationCallback(self, count,population,scores):
		sys.stdout.write(str(count)+"\n")
		pass
	
	
def run():
	random.seed(0)
	test_rosenbrock_function()
	sys.stdout.write("OK\n")
	
	
if __name__ == "__main__":
	run() 


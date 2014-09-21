from __future__ import division
from threading import Lock, Thread
from time import clock, sleep
import pdb
from nec.print_out import printOut
class ProcessMonitor:
	def __init__(self, max_run_time = 3600):
		self.stop = 0
		self.lock = Lock()
		self.thread = None
		self.processes = {}
		self.count = 0
		self.max_time = 0
		self.killed = {}
		self.max_run_time = max_run_time
	def addProcess(self, process):
		try:
			self.lock.acquire()
			self.processes[process] = clock()
			if self.thread == None:
				self.thread = Thread(target = self.monitor)
				self.thread.start()
		finally:
			self.lock.release()
		
	def removeProcess(self, process):
		try:
			self.lock.acquire()
			assert(process in self.processes)
			if process not in self.killed:
				#pdb.set_trace()
				self.max_time = max(self.max_time, clock() - self.processes[process])
				self.count+=1
				#printOut("Max engine wait time : %g\n" %self.max_time)
			else:
				del self.killed[process]
			del self.processes[process]
		finally:
			self.lock.release()
			
	def join(self):
		self.stop = 1
		if self.thread:
			self.thread.join()
			
	def monitor(self):
		while not self.stop:
			sleep(1)
			try:
				self.lock.acquire()
				max_time = self.max_time
				processes = dict(self.processes)
				killed = dict(self.killed)
				count = self.count
			finally:
				self.lock.release()
			c = clock()
			for p in processes.keys():
				diff = c - processes[p]
				if ( count > 100 and diff > 10*max_time or diff > self.max_run_time ) and not p in killed:
					try:
						self.lock.acquire()
						self.killed[p] = c
					finally:
						self.lock.release()
					try:
						printOut("Killing hanging engine\n")
						p.kill()
					except:
						pass

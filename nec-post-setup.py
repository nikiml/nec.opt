import winreg as wr
import sys

def createBatFiles():
	dir = sys.prefix+"\\lib\\site-packages\\nec\\"
	eval = open(dir+"eval.bat", "wt")
	eval.write("@echo off\n")
	eval.write("%~d1\n")
	eval.write("cd %~p1\n")
	eval.write("set PATH=%PATH%;"+sys.prefix+";"+dir+"engines\n")
	eval.write("python -m nec.eval %1\n")
	eval.write("pause\n")
	eval.close()
	file_created(dir+"eval.bat")

	opt = open(dir+"opt.bat", "wt")
	opt.write("@echo off\n")
	opt.write("%~d1\n")
	opt.write("cd %~p1\n")
	opt.write("set PATH=%PATH%;"+sys.prefix+";"+dir+"engines\n")
	opt.write("echo Optimizing  %~nx1\n")
	opt.write("python -m nec.opt %1\n")
	opt.write("pause\n")
	opt.close()
	file_created(dir+"opt.bat")

	opt = open(dir+"restart.bat", "wt")
	opt.write("@echo off\n")
	opt.write("%~d1\n")
	opt.write("cd %~p1\n")
	opt.write("set PATH=%PATH%;"+sys.prefix)
	opt.write("python -m nec.extract_last_population -n-1 -s -r -l %1 \n")
	opt.write("pause\n")
	opt.close()
	file_created(dir+"restart.bat")

def registerBatFile(ext, bat, name):
	ext_key = wr.CreateKey(wr.HKEY_CLASSES_ROOT, '.'+ext)
	try:
		auto_file = wr.EnumValue(ext_key,0)[1]
	except:
		auto_file = ext+'_auto_file'
		wr.SetValue(ext_key,'', wr.REG_SZ, auto_file)

	key = wr.CreateKey(wr.HKEY_CLASSES_ROOT, auto_file)
	key = wr.CreateKey(key, 'shell')
	key = wr.CreateKey(key, name)
	key = wr.CreateKey(key, 'command')
	wr.SetValue(key, '', wr.REG_SZ, bat+' "%1"')
	
def unregisterCommand(ext, name):
	try:
		ext_key = wr.OpenKey(wr.HKEY_CLASSES_ROOT, '.'+ext)
	except: return
	try:
		auto_file = wr.EnumValue(ext_key,0)[1]
	except: return

	try: auto_key = wr.OpenKey(wr.HKEY_CLASSES_ROOT, auto_file, 0, wr.KEY_ALL_ACCESS)
	except: return
	try: shell_key = wr.OpenKey(auto_key, 'shell', 0, wr.KEY_ALL_ACCESS)
	except: return
	
	try: 
		name_key = wr.OpenKey(shell_key, name, 0, wr.KEY_ALL_ACCESS)
		wr.DeleteKey(name_key, 'command')
		wr.DeleteKey(name_key, '')
	except: pass
		
def install():
	createBatFiles()
	dir = sys.prefix+"\\lib\\site-packages\\nec\\"
	registerBatFile('nec', dir+'eval.bat', 'Evaluate')
	registerBatFile('nec', dir+'opt.bat', 'Optimize')
	registerBatFile('opt_log', dir+'restart.bat', 'Generate restart file')
	
def remove():
	unregisterCommand('nec', 'Evaluate')
	unregisterCommand('nec', 'Optimize')
	unregisterCommand('opt_log', 'Generate restart file')

	
if sys.argv[1]== '-install':
	install()
elif sys.argv[1]== '-remove':
	remove()


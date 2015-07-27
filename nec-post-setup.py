import sys,os

def fileCreate(file):
	try:
		file_created(file)
	except:
		pass

def createBatFiles():
	dir = sys.prefix+"\\lib\\site-packages\\nec\\"
	f = open(dir+"eval.bat", "wt")
	f.write("@echo off\n")
	f.write("%~d1\n")
	f.write("cd %~p1\n")
	f.write("set PATH=%PATH%;"+sys.prefix+";"+dir+"engines\n")
	f.write("python -m nec.eval %1\n")
	f.write("pause\n")
	f.close()
	fileCreate(dir+"eval.bat")

	f = open(dir+"opt.bat", "wt")
	f.write("@echo off\n")
	f.write("%~d1\n")
	f.write("cd %~p1\n")
	f.write("set PATH=%PATH%;"+sys.prefix+";"+dir+"engines\n")
	f.write("echo Optimizing  %~nx1\n")
	f.write("python -m nec.opt %1\n")
	f.write("pause\n")
	f.close()
	fileCreate(dir+"opt.bat")

	f = open(dir+"restart.bat", "wt")
	f.write("@echo off\n")
	f.write("%~d1\n")
	f.write("cd %~p1\n")
	f.write("set PATH=%PATH%;"+sys.prefix+"\n")
	f.write("python -m nec.extract_last_population -n-1 -s -r -l %1 \n")
	f.write("pause\n")
	f.close()
	fileCreate(dir+"restart.bat")
	
	f = open(dir+"eval_params.bat", "wt")
	f.write("@echo off\n")
	f.write("%~d1\n")
	f.write("cd %~p1\n")
	f.write("set PATH=%PATH%;"+sys.prefix+";"+dir+"engines\n")
	f.write("for /f \"delims=\" %%x in ('dir /od /b best*.nec ^| findstr \.nec$') do set last_best=%%x\n")
	f.write("python -m nec.eval --param=%1 %last_best%\n")
	f.write("pause\n")
	f.close()
	fileCreate(dir+"eval_params.bat")
	
	f = open(dir+"history.bat", "wt")
	f.write("@echo off\n")
	f.write("%~d1\n")
	f.write("cd %~p1\n")
	f.write("set PATH=%PATH%;"+sys.prefix+"\n")
	f.write("python -m nec.extract_last_population -p -l %1 \n")
	f.write("pause\n")
	f.close()
	fileCreate(dir+"history.bat")
	

def registerBatFile(ext, bat, name):
	import winreg as wr
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
	wr.SetValue(key, '', wr.REG_SZ, '"'+bat+'" "%1"')
	
def unregisterCommand(ext, name):
	import winreg as wr
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
	registerBatFile('opt_log', dir+'history.bat', 'Show evolution history')
	registerBatFile('nec_sym', dir+'eval_params.bat', 'Evaluate with params')
	
def remove():
	unregisterCommand('nec', 'Evaluate')
	unregisterCommand('nec', 'Optimize')
	unregisterCommand('opt_log', 'Generate restart file')
	unregisterCommand('opt_log', 'Show evolution history')
	unregisterCommand('nec_sym', 'Evaluate with params')


if os.name == 'nt':	
	if sys.argv[1]== '-install':
		install()
	elif sys.argv[1]== '-remove':
		remove()


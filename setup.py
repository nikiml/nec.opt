from distutils.core import setup
setup(name='nec',
      version='0.16.134',
      author='Nikolay Mladenov',
      author_email='Nikolay dot Mladenov at gmail dot com',
      packages=['nec'],
      package_dir={'nec':'nec'},
      package_data={'nec':['html/custom.css','html/blueprint/*.css','html/js/*min.js','html/js/menu.js', 'engines/*']},
	  scripts=['nec-post-setup.py','nec_eval.sh', 'nec_opt.sh', 'nec_restart_gen.sh'],
      url='http://clients.teksavvy.com/~nickm/scripts.html',
      license='GPL'
      )


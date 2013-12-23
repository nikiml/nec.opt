from distutils.core import setup
setup(name='nec',
      version='0.11.104',
      author='Nikolay Mladenov',
      author_email='Nikolay dot Mladenov at gmail dot com',
      packages=['nec'],
      package_dir={'nec':'nec'},
      package_data={'nec':['html/custom.css','html/blueprint/*.css','html/js/*min.js','html/js/menu.js']},
      url='http://clients.teksavvy.com/~nickm/scripts.html',
      license='GPL'
      )


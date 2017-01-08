from distutils.core import setup
from version import git_commit_sha
setup(name='nec',
      version='0.17.'+git_commit_sha,
      author='Nikolay Mladenov',
      author_email='Nikolay dot Mladenov at gmail dot com',
      packages=['nec'],
      package_dir={'nec':'nec'},
      package_data={'nec':['css/*.css','js/*min.js', 'engines/*', 'viewer/c.html', 'viewer/chp.html', 'viewer/g2.html', 'viewer/gc2.html', 'viewer/gchp2.html', 'viewer/n2.html']},
	  scripts=['nec-post-setup.py','nec_eval.sh', 'nec_opt.sh', 'nec_restart_gen.sh'],
      url='http://mladenov.ca/~nickm/scripts.html',
      license='GPL'
      )


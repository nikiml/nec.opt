python setup.py sdist 
python setup.py build --plat-name=win32 bdist_wininst --install-script nec-post-setup.py --user-access-control force
python setup.py build --plat-name=win-amd64 bdist_wininst --install-script nec-post-setup.py --user-access-control force

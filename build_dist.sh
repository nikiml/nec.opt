cp MANIFEST.nonwin MANIFEST
cp setup.py.nonwin setup.py
python setup.py sdist 
cp MANIFEST.win MANIFEST
cp setup.py.win setup.py
/h/bin/x64/Python26/python setup.py sdist 
/h/bin/x64/Python32/python setup.py build --plat-name=win32 bdist_wininst --install-script nec-post-setup.py --user-access-control force
/h/bin/x64/Python32/python setup.py build --plat-name=win-amd64 bdist_wininst --install-script nec-post-setup.py --user-access-control force
rm MANIFEST
rm setup.py

echo "git_commit_sha=\"`git rev-parse --short HEAD`\"" > version.py
python setup.py sdist

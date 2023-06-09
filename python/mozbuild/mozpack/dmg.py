# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import errno
import mozfile
import os
import fnmatch
import platform
import shutil
import subprocess

is_linux = platform.system() == 'Linux'

def mkdir(dir):
    if not os.path.isdir(dir):
        try:
            os.makedirs(dir)
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise


def chmod(dir):
    'Set permissions of DMG contents correctly'
    subprocess.check_call(['chmod', '-R', 'a+rX,a-st,u+w,go-w', dir])


def rsync(source, dest):
    'rsync the contents of directory source into directory dest'
    # Ensure a trailing slash so rsync copies the *contents* of source.
    if not source.endswith('/'):
        source += '/'
    subprocess.check_call(['rsync', '-a', '--copy-unsafe-links',
                           source, dest])


def set_folder_icon(dir):
    'Set HFS attributes of dir to use a custom icon'
    if not is_linux:
        #TODO: bug 1197325 - figure out how to support this on Linux
        subprocess.check_call(['SetFile', '-a', 'C', dir])


def create_dmg_from_staged(stagedir, output_dmg, tmpdir, volume_name):
    'Given a prepared directory stagedir, produce a DMG at output_dmg.'
    if not is_linux:
        # Running on OS X
        hybrid = os.path.join(tmpdir, 'hybrid.dmg')
        subprocess.check_call(['hdiutil', 'create',
                               '-fs', 'HFS+',
                               '-volname', volume_name,
                               '-srcfolder', stagedir,
                               '-ov', hybrid])
        subprocess.check_call(['hdiutil', 'convert', '-format', 'UDBZ',
                               '-imagekey', 'bzip2-level=9',
                               '-ov', hybrid, '-o', output_dmg])
    else:
        import buildconfig
        uncompressed = os.path.join(tmpdir, 'uncompressed.dmg')
        subprocess.check_call([
            buildconfig.substs['GENISOIMAGE'],
            '-V', volume_name,
            '-D', '-R', '-apple', '-no-pad',
            '-o', uncompressed,
            stagedir
        ])
        subprocess.check_call([
            buildconfig.substs['DMG_TOOL'],
            'dmg',
            uncompressed,
            output_dmg
        ],
        # dmg is seriously chatty
        stdout=open(os.devnull, 'wb'))

def check_tools(*tools):
    '''
    Check that each tool named in tools exists in SUBSTS and is executable.
    '''
    import buildconfig
    for tool in tools:
        path = buildconfig.substs[tool]
        if not path:
            raise Exception('Required tool "%s" not found' % tool)
        if not os.path.isfile(path):
            raise Exception('Required tool "%s" not found at path "%s"' % (tool, path))
        if not os.access(path, os.X_OK):
            raise Exception('Required tool "%s" at path "%s" is not executable' % (tool, path))

def create_dmg(source_directory, output_dmg, volume_name, extra_files):
    '''
    Create a DMG disk image at the path output_dmg from source_directory.

    Use volume_name as the disk image volume name, and
    use extra_files as a list of tuples of (filename, relative path) to copy
    into the disk image.
    '''
    if platform.system() not in ('Darwin', 'Linux'):
        raise Exception("Don't know how to build a DMG on '%s'" % platform.system())

    if is_linux:
        check_tools('DMG_TOOL', 'GENISOIMAGE')
    with mozfile.TemporaryDirectory() as tmpdir:
        import buildconfig
        stagedir = os.path.join(tmpdir, 'stage')
        os.mkdir(stagedir)
        # Copy the app bundle over using rsync
        rsync(source_directory, stagedir)
        # Copy extra files
        for source, target in extra_files:
            full_target = os.path.join(stagedir, target)
            mkdir(os.path.dirname(full_target))
            shutil.copyfile(source, full_target)
        # Make a symlink to /Applications. The symlink name is a space
        # so we don't have to localize it. The Applications folder icon
        # will be shown in Finder, which should be clear enough for users.
        os.symlink('/Applications', os.path.join(stagedir, ' '))
        # Set the folder attributes to use a custom icon
        set_folder_icon(stagedir)
        chmod(stagedir)
        if not is_linux:
            identity = buildconfig.substs['MOZ_MACBUNDLE_IDENTITY']
            if identity != '':
                dylibs = []
                appbundle = os.path.join(stagedir, buildconfig.substs['MOZ_MACBUNDLE_NAME'])
                # If the -bin file is in Resources add it to the dylibs as well
                resourcebin = os.path.join(appbundle, 'Contents/Resources/' + buildconfig.substs['MOZ_APP_NAME'] + '-bin')
                if os.path.isfile(resourcebin):
                    dylibs.append(resourcebin)
                # Create a list of dylibs in Contents/Resources that won't get signed by --deep
                for root, dirnames, filenames in os.walk('Contents/Resources/'):
                    for filename in fnmatch.filter(filenames, '*.dylib'):
                        dylibs.append(os.path.join(root, filename))
                entitlement = os.path.abspath(os.path.join(os.getcwd(), '../../platform/security/mac/production.entitlements.xml'))
                subprocess.check_call(['codesign', '--deep', '--timestamp', '--options', 'runtime', '--entitlements', entitlement, '-s', identity] + dylibs + [appbundle])
        create_dmg_from_staged(stagedir, output_dmg, tmpdir, volume_name)

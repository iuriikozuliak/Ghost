var plan = require('flightplan');
var withUser = {
	user: 'blognode'
};
var tmpDir = 'tmp-'+new Date().getTime();

plan.target('production', {
	host: 'blog.rivalfox.com',
	username: 'blognode',
	port: 2224,
	agent: process.env.SSH_AUTH_SOCK
});


plan.local(function(local){
	var filesToCopy = local.exec('git ls-files', {silent: true});
	local.transfer(filesToCopy, tmpDir);
});

plan.remote(function(remote){
	remote.log('Move folder to web root');
  remote.cp('-R ~/' + tmpDir + '/. ~/ghost/', withUser);
  remote.rm('-rf ~/' + tmpDir);

  remote.log('Install dependencies');
  remote.with('cd ghost', function(){
  	remote.sudo('npm i --production', withUser);
		remote.log('Reload application');
		remote.sudo('forever restart index.js', withUser);
  });
});
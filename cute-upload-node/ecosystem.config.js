module.exports = {
	apps: [{
		port: 5845,
		name: 'cute-upload-node',
		script: './dist/index.js',
		watch: './dist',
		instances: 5,
		exec_mode: 'cluster', // 使用 cluster 模式
	}],

	deploy: {
		production: {
			user: 'SSH_USERNAME',
			ref: 'origin/master',
			repo: 'GIT_REPOSITORY',
			path: 'DESTINATION_PATH',
			'pre-deploy-local': '',
			'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
			'pre-setup': '',
		}
	}
};

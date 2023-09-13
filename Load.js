class Member{
	id = 0;
	first_name = "NAHI";
	last_name = "HAI";
	gender = "";
	partner_id = 0;
	parent_id = 0;

	child_members = [];
}

class MemberTree {
	async getData(url){
		let response = await fetch(url);
		let text = await response.text();
		var members = [];
		var lines = text.split("\n");
		var header = lines[0].split(",");
		for(var i = 1; i < lines.length-1; i++){
			var m = new Member();
			var line = lines[i].split(",");
			for(var j = 0; j < line.length; j++){
				m[header[j]] = line[j];
			}
			members.push(m);
		}
		return members;
	}
	async makeTree(url){
		var members = await this.getData(url);
		var orig = members;
		members = members.filter(m => m.parent_id != "0");
		var parent_child_map = {}
		members.reduce((tot,m) => {
			parent_child_map[m.id] = m;
		},0);
		members.forEach(m => {
			if(m.parent_id == "-1"){
				this.root = m;
			}
			else {
				parent = parent_child_map[m.parent_id];
				parent.child_members.push(m);
			}
		});
		return [this.root,orig];
	}
}
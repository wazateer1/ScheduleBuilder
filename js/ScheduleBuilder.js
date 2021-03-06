var app;
app = angular.module('app', []);

app.controller("InfoPageController", function ($rootScope, $scope, $http) {
	$scope.templateBuild = {
		schedule: "Template",
		people: {
			"Admin McCoolPants": {
				skills: [0, 1]
			},
			"Cool Guy": {
				skills: [0]
			}
		},
		skills: {
			"0": "Awesomeness",
			"1": "Coolness"
		},
		multiSkillRoles: {
			"System Admin": {
				requires: [0, 1]
			}
		},
		teamArchetypes: {
			"Doing Stuff Team": {
				roles: {
					Leader: {
						requires: [0]
					}
				},
				newrole: ""
			}
		},
		teams: {
			"A-Team": {
				archetype: "Doing Stuff Team",
				members: {
					Leader: "Cool Guy"
				}
			}
		},
		days: [
			{
				roles: {
					multiSkillRoles: ["System Admin"],
					teamArchetypes: ["Doing Stuff Team"]
				},
				shifts: [
					{
						start: "12 : 00 PM",
						end: "1 : 00 PM",
						"System Admin": "Admin McCoolPants",
						"Doing Stuff Team": "A-Team"
					}
				]
			}
		]
	};

	$http.get("php/getScheduleNames.php").then(function (response) {
		$scope.schedules = response.data;
	}, function (response) {
		console.log("Error" + response.data);
	});

	$scope.getScheduleData = function (scheduleName) {
		$http.get("php/getSchedule.php", {
			params: {
				competition: scheduleName
			}
		}).then(function (response) {
			$scope.startBuilder(response.data);
		}, function (response) {
			console.log("Error: " + response.data);
		});
	};

	$scope.startBuilder = function (build) {
		if (build) {
			$rootScope.build = build;
		} else {
			$rootScope.build = $scope.templateBuild;
		}
		$("#Intro").addClass("hidden");
		$("#Builder").removeClass("hidden");

	};
});

app.controller("ScheduleBuilderController", function ($rootScope, $scope) {
	$scope.new = {
		person: "",
		skill: "",
		multiSkillRole: "",
		teamArchetype: "",
		team: ""
	};
	
	var hasProperty = function (object, property) {
		for (var prop in object) {
			if (object.hasOwnProperty(prop)) {
				if (prop.toLowerCase().trim() == property.toLowerCase().trim()) {
					return true;
				}
			}
		}
		return false;
	}

	$scope.add = function (addMode) {
		switch (addMode) {
			case "Person":
				if (!hasProperty($rootScope.build.people, $scope.new.person)) {
					$rootScope.build.people[$scope.new.person] = {
						skills: []
					};
					$scope.new.person = "";
				}
				break;
			case "Skill":
				if (!hasProperty($rootScope.build.skills, $scope.new.skill)) {
					$rootScope.build.skills[Object.getOwnPropertyNames($rootScope.build.skills).length] = $scope.new.skill;
					$scope.new.skill = "";
				}
				break;
			case "MultiSkillRole":
				if (!hasProperty($rootScope.build.multiSkillRoles, $scope.new.multiSkillRole)) {
					$rootScope.build.multiSkillRoles[$scope.new.multiSkillRole] = {
						requires: []
					};
					$scope.new.multiSkillRole = "";
				}
				break;
			case "teamArchetype":
				if (!hasProperty($rootScope.build.teamArchetypes, $scope.new.teamArchetype)) {
					$rootScope.build.teamArchetypes[$scope.new.teamArchetype] = {
						roles: {}
					};
					$scope.new.teamArchetype = "";
				}
				break;
			case "Team":
				if (!hasProperty($rootScope.build.teams, $scope.new.team)) {
					$rootScope.build.teams[$scope.new.team] = {
						archetype: "",
						members: {}
					};
					$scope.new.team = "";
				}
				break;
		}
	};
	
	$scope.removeStem = function (removeType, item, array) {
		switch (removeType) {
			case "Person":
				break;
			case "Skill":
				array.splice(array.indexOf(item), 1);
				break;
			case "MultiSkillRole":
				break;
			case "teamArchetype":
				break;
			case "Team":
				break;
		}
	};

	$scope.removeRoot = function (removeType, item, archetypeRole) {
		switch (removeType) {
			case "Person":
				delete $rootScope.build.people[item];
				break;
			case "Skill":
				var skillIndex;
				for (var skillId in $rootScope.build.skills) {
					if ($rootScope.build.skills[skillId] == item) {
						skillIndex = parseInt(skillId);
					}
				}
				delete $rootScope.build.skills[skillIndex];
				for (var name in $rootScope.build.people) {
					if ($rootScope.build.people.hasOwnProperty(name)) {
						var obj = $rootScope.build.people[name];
						obj.skills.splice(obj.skills.indexOf(skillIndex), 1);
					}
				}
				for (var name in $rootScope.build.multiSkillRoles) {
					if ($rootScope.build.multiSkillRoles.hasOwnProperty(name)) {
						var obj = $rootScope.build.multiSkillRoles[name];
						obj.requires.splice(obj.requires.indexOf(skillIndex), 1);
					}
				}
				for (var name in $rootScope.build.teamArchetypes) {
					if ($rootScope.build.teamArchetypes.hasOwnProperty(name)) {
						var obj = $rootScope.build.teamArchetypes[name];
						for (var role in obj.roles) {
							if (obj.roles.hasOwnProperty(role)) {
								obj.roles[role].requires.splice(obj.roles[role].requires.indexOf(skillIndex), 1);
							}
						}
					}
				}
				break;
			case "MultiSkillRole":
				delete $rootScope.build.multiSkillRoles[item];
				break;
			case "teamArchetype":
				delete $rootScope.build.teamArchetypes[item];
				break;
			case "archetypeRole":
				delete $rootScope.build.teamArchetypes[item].roles[archetypeRole];
				break;
			case "Team":
				delete $rootScope.build.teams[item];
				break;
		}
	}

	$scope.addArchetypeRole = function (archetype) {
		if (!hasProperty($rootScope.build.teamArchetypes[archetype].roles, $rootScope.build.teamArchetypes[archetype].newrole)) {
			$rootScope.build.teamArchetypes[archetype].roles[$rootScope.build.teamArchetypes[archetype].newrole] = {
				requires: []
			};
			$rootScope.build.teamArchetypes[archetype].newrole = "";
		}
	};

	$scope.updateRoles = function (team) {
		$rootScope.build.teams[team].members = {};
		for (var role in $rootScope.build.teamArchetypes[$rootScope.build.teams[team].archetype].roles) {
			$rootScope.build.teams[team].members[role] = "";
		}
	}

	$scope.refreshSkillDraggability = function () {
		$(".draggable-skill").draggable({
			helper: "clone"
		});
	}

	$scope.refreshPeopleDraggability = function () {
		$(".draggable-person").draggable({
			helper: "clone"
		});
		$(".draggable-person").droppable({
			drop: function (event, ui) {
				var newSkillId = parseInt(ui.draggable[0].id);
				$rootScope.build.people[event.target.id].skills.push(newSkillId);
				$scope.$apply();
			},
			accept: function (droppable) {
				if (!$($(droppable)[0]).hasClass("draggable-skill")) {
					return false;
				}
				var person = $rootScope.build.people[$(this).attr("id")];
				var skill = $($(droppable)[0]).attr("id");
				return person.skills.every(function (learnedSkill) {
					return learnedSkill != skill;
				});
			},
			addClasses: false,
			activeClass: "droppable",
			tolerance: "pointer"
		});

	};

	$scope.refreshMultiSkillRolesDraggability = function () {
		$(".draggable-multi-skill-role").draggable({
			helper: "clone"
		});
		$(".draggable-multi-skill-role").droppable({
			drop: function (event, ui) {
				var newSkillId = parseInt(ui.draggable[0].id);
				$rootScope.build.multiSkillRoles[event.target.id].requires.push(newSkillId);
				$scope.$apply();
			},
			accept: function (droppable) {
				if (!$($(droppable)[0]).hasClass("draggable-skill")) {
					return false;
				}
				var requiredSkills = $rootScope.build.multiSkillRoles[$(this).attr("id")].requires;
				var skill = $($(droppable)[0]).attr("id");
				return requiredSkills.every(function (requiredSkill) {
					return requiredSkill != skill
				});
			},
			addClasses: false,
			activeClass: "droppable",
			tolerance: "pointer"
		});
	};

	$scope.refreshTeamRoleDraggability = function () {
		$(".draggable-team-role").droppable({
			drop: function (event, ui) {
				var newSkillId = parseInt(ui.draggable[0].id);
				var role = event.target.id.split("|");
				$rootScope.build.teamArchetypes[role[0]].roles[role[1]].requires.push(newSkillId);
				$scope.$apply();
			},
			accept: function (droppable) {
				if (!$($(droppable)[0]).hasClass("draggable-skill")) {
					return false;
				}
				var archetypeName = $($(this)[0]).attr("id").split("|")[0];
				var role = $($(this)[0]).attr("id").split("|")[1];
				var requiredSkills = $rootScope.build.teamArchetypes[archetypeName].roles[role].requires;
				var skill = $($(droppable)[0]).attr("id");

				return requiredSkills.every(function (requiredSkill) {
					return requiredSkill != skill
				});
			},
			addClasses: false,
			activeClass: "droppable",
			tolerance: "pointer"
		});
	};

	$scope.refreshTeamMemberDraggability = function () {
		$(".draggable-team-member").droppable({
			drop: function (event, ui) {
				var memberName = ui.draggable[0].id;
				var role = event.target.id.split("|");
				$rootScope.build.teams[role[0]].members[role[1]] = memberName;
				$scope.$apply();
			},
			accept: function (droppable) {
				if (!$($(droppable)[0]).hasClass("draggable-person")) {
					return false;
				}
				var learnedSkills = $rootScope.build.people[$($(droppable)[0]).attr("id")].skills;
				var team = $($(this)[0]).attr("id").split("|")[0];
				var archetype = $rootScope.build.teams[team].archetype;
				var role = $($(this)[0]).attr("id").split("|")[1];
				var requiredSkills = $rootScope.build.teamArchetypes[archetype].roles[role].requires;
				console.log(learnedSkills);

				return requiredSkills.every(function (requiredSkill) {
					return !(learnedSkills.indexOf(requiredSkill) == -1);
				});
			},
			addClasses: false,
			activeClass: "droppable",
			tolerance: "pointer"
		});
	};

	$scope.bringForward = function (sbpanel) {
		switch (sbpanel) {
		case 'schedule-loader':
			$(".sb-panel").addClass("hidden");
			$(".tab").removeClass("active");
			$("#Intro").removeClass("hidden");
			$("#Builder").addClass("hidden");
			break;
		case 'people':
			$(".sb-panel").addClass("hidden");
			$(".tab").removeClass("active");
			$("#people").removeClass("hidden");
			$("#people-tab").addClass("active");
			$("#skills").removeClass("hidden");
			$("#skills-tab").addClass("active");
			break;
		case 'skills':
			$(".sb-panel").addClass("hidden");
			$(".tab").removeClass("active");
			$("#skills").removeClass("hidden");
			$("#skills-tab").addClass("active");
			break;
		case 'multi-skill-roles':
			$(".sb-panel").addClass("hidden");
			$(".tab").removeClass("active");
			$("#multi-skill-roles").removeClass("hidden");
			$("#multi-skill-roles-tab").addClass("active");
			$("#skills").removeClass("hidden");
			$("#skills-tab").addClass("active");
			break;
		case 'team-archetypes':
			$(".sb-panel").addClass("hidden");
			$(".tab").removeClass("active");
			$("#team-archetypes").removeClass("hidden");
			$("#team-archetypes-tab").addClass("active");
			$("#skills").removeClass("hidden");
			$("#skills-tab").addClass("active");
			break;
		case 'teams':
			$(".sb-panel").addClass("hidden");
			$(".tab").removeClass("active");
			$("#teams").removeClass("hidden");
			$("#teams-tab").addClass("active");
			$("#people").removeClass("hidden");
			$("#people-tab").addClass("active");
			break;
		case 'schedule':
			$(".sb-panel").addClass("hidden");
			$(".tab").removeClass("active");
			$("#schedule").removeClass("hidden");
			$("#schedule-tab").addClass("active");
			break;
		}
	};
});

app.controller("SchedulerController", function ($rootScope, $scope, $timeout, $http) {

	$scope.currentDay = 0;

	$scope.isMultiSkillRole = function (elm) {
		var classList = elm.attr("class").split(" ");
		for (var i = 0; i < classList.length; i++) {
			if (classList[i] === "sched-draggable-multi-skill-role") {
				return true;
			}
		}
		return false;
	};

	$scope.isTeamArchetype = function (elm) {
		var classList = elm.attr("class").split(" ");
		for (var i = 0; i < classList.length; i++) {
			if (classList[i] === "sched-draggable-team-archetype") {
				return true;
			}
		}
		return false;
	};

	$(".sched-draggable-role").droppable({
		drop: function (event, ui) {
			if ($scope.isMultiSkillRole(ui.draggable)) {
				$rootScope.build.days[$scope.currentDay].roles.multiSkillRoles.push(ui.draggable[0].id);
			} else if ($scope.isTeamArchetype(ui.draggable)) {
				$rootScope.build.days[$scope.currentDay].roles.teamArchetypes.push(ui.draggable[0].id);
			}
			$scope.$apply();
		},
		accept: function (droppable) {
			var assignedRoles = $rootScope.build.days[$scope.currentDay].roles.multiSkillRoles;
			var assignedArchetypes = $rootScope.build.days[$scope.currentDay].roles.teamArchetypes;
			
			if ($scope.isMultiSkillRole($($(droppable)[0]))) {
				return assignedRoles.indexOf($($(droppable)[0]).attr("id")) == -1;
			} else if ($scope.isTeamArchetype($($(droppable)[0]))) {
				return assignedArchetypes.indexOf($($(droppable)[0]).attr("id")) == -1;
			}
		},
		addClasses: false,
		tolerance: "pointer"
	});

	$scope.changeDay = function (index) {
		$scope.currentDay = index;
	};

	$scope.initTimePicker = function (id, start) {
		var time = start.split(" ");
		if (time[3] === "PM" && time[0] !== "12") {
			time[0] = (parseInt(time[0]) + 12).toString();
		}
		$timeout(function () {
			$("#" + id).wickedpicker({
				now: time[0] + ":" + time[2]
			});
		});
	};

	$scope.refreshSchedPeopleDraggability = function () {
		$timeout(function () {
			$(".sched-draggable-person").draggable({
				helper: "clone"
			});
		});
	};

	$scope.refreshSchedMultiSkillRolesDraggability = function () {
		$timeout(function () {
			$(".sched-draggable-multi-skill-role").draggable({
				helper: "clone"
			});
		});
	};

	$scope.refreshSchedTeamArchetypesDraggability = function () {
		$timeout(function () {
			$(".sched-draggable-team-archetype").draggable({
				helper: "clone"
			});
		});
	};

	$scope.refreshSchedTeamDraggability = function () {
		$timeout(function () {
			$(".sched-draggable-team").draggable({
				helper: "clone"
			});
		});
	};

	$scope.refreshSchedTeamRolesDraggability = function () {
		$(".sched-draggable-team-role").droppable({
			drop: function (event, ui) {
				var id = event.target.id.split("|");
				var index = 0;
				$rootScope.build.days[$scope.currentDay].shifts.forEach(function (e, i, arr) {
					if (e.start == id[0]) {
						index = i;
					}
				});
				$rootScope.build.days[$scope.currentDay].shifts[index][id[1]] = ui.draggable[0].id;
				$scope.$apply();
			},
			accept: function (droppable) {
				if (!$($(droppable)[0]).hasClass("sched-draggable-team")) {
					return false;
				} else if (this.id.split("|")[1] === $rootScope.build.teams[droppable[0].id].archetype) {
					return true;
				} else {
					return false;
				}
			},
			addClasses: false,
			tolerance: "pointer"
		});
	};

	$scope.refreshSchedMultiSkillRolesDroppability = function () {
		$(".sched-droppable-multi-skill-role").droppable({
			drop: function (event, ui) {
				var id = event.target.id.split("|");
				var index = 0;
				$rootScope.build.days[$scope.currentDay].shifts.forEach(function (e, i, arr) {
					if (e.start == id[0]) {
						index = i;
					}
				});


				$rootScope.build.days[$scope.currentDay].shifts[index][id[1]] = ui.draggable[0].id;
				$scope.$apply();
			},
			accept: function (droppable) {
				if (!$($(droppable)[0]).hasClass("sched-draggable-person")) {
					return false;
				}
				var id = droppable[0].id;
				var learnedSkills = $rootScope.build.people[id].skills;
				var multiSkillRole = this.id.split("|")[1];
				var requiredSkills = $rootScope.build.multiSkillRoles[multiSkillRole].requires;
				return requiredSkills.every(function (requiredSkill) {
					return !(learnedSkills.indexOf(requiredSkill) == -1);
				});
			},
			addClasses: false,
			tolerance: "pointer"
		});
	};

	$scope.addShift = function () {
		var startTime, endTime;
		if ($rootScope.build.days[$scope.currentDay].shifts.length > 0) {
			startTime = $rootScope.build.days[$scope.currentDay].shifts[$rootScope.build.days[$scope.currentDay].shifts.length - 1].end;
			var startTimeArr = startTime.split(" ");
			endTime = (parseInt(startTimeArr[0]) + 1).toString() + " : " + startTimeArr[2] + " " + startTimeArr[3];
		} else {
			startTime = "8 : 00 AM";
			endTime = "9 : 00 AM";
		}
		$rootScope.build.days[$scope.currentDay].shifts.push({
			start: startTime,
			end: endTime
		});
	};

	$scope.removeRole = function (role) {
		$rootScope.build.days[$scope.currentDay].roles.multiSkillRoles.splice($rootScope.build.days[$scope.currentDay].roles.multiSkillRoles.indexOf(role), 1);
		$rootScope.build.days[$scope.currentDay].shifts.forEach(function (e, i, arr) {
			delete $rootScope.build.days[$scope.currentDay].shifts[i][role];
		});
	};

	$scope.removeTeamArchetype = function (teamArchetype) {
		$rootScope.build.days[$scope.currentDay].roles.teamArchetypes.splice($rootScope.build.days[$scope.currentDay].roles.teamArchetypes.indexOf(teamArchetype), 1);
	};

	$scope.removeShift = function (shift) {
		$rootScope.build.days[$scope.currentDay].shifts.splice(shift, 1);
	};

	$scope.generateCsv = function () {
		var json = $rootScope.build;
		var csv = [];
		var csvData = "";

		csv["competitionName"] = json["schedule"] != undefined ? json["schedule"] : "Untitled";
		csv["teams"] = {};
		for (var teamName in json["teams"]) {
			if (json["teams"].hasOwnProperty(teamName)) {
				csv["teams"][teamName] = json["teams"][teamName]["members"];
			}
		}
		csv["days"] = [];
		for (var i = 0; i < json["days"].length; i++) {
			csv["days"].push(json["days"][i]);
		}
		for (i = 0; i < csv["days"].length; i++) {
			for (j = 0; j < csv["days"][i]["shifts"].length; j++) {
				var start = csv["days"][i]["shifts"][j]["start"].split(" ");
				var end = csv["days"][i]["shifts"][j]["end"].split(" ");

				csv["days"][i]["shifts"][j]["start"] = start[0] + ":" + start[2] + " " + start[3];
				csv["days"][i]["shifts"][j]["end"] = end[0] + ":" + end[2] + " " + end[3];

				csv["days"][i]["shifts"][j]["start"] = start.join(" ");
				csv["days"][i]["shifts"][j]["end"] = end.join(" ");
			}
		}

		var csvData = csv["competitionName"] + " Schedule,\n,\n";
		var teamLines = "";
		for (var teamName in csv["teams"]) {
			var roleLines = "";
			for (var roleName in csv["teams"][teamName]) {
				if (csv["teams"][teamName].hasOwnProperty(roleName)) {
					roleLines += "," + roleName + ": " + csv["teams"][teamName][roleName] + "\n";
				}
			}
			teamLines += teamName + roleLines;
		}
		teamLines = teamLines.trim();

		csvData += teamLines + "\n,\n,\n";

		var dayLines = "";
		for (i = 0; i < csv["days"].length; i++) {
			var shiftLines = "";
			var roleNames = [];
			var roleNames = csv["days"][i]["roles"]["multiSkillRoles"];

			for (var shift in csv["days"][i]["shifts"]) {
				var roleLines = "";
				for (var positionName in csv["days"][i]["shifts"][shift]) {
					if (csv["days"][i]["shifts"][shift].hasOwnProperty(positionName)) {
						if (positionName != "start" && positionName != "end") {
							for (k = 0; k < roleNames.length; k++) {
								if (positionName == roleNames[k]) {
									roleLines += "," + positionName + ": " + csv["days"][i]["shifts"][shift][positionName] + "\n";
									k = roleNames.length;
								} else if (k == (roleNames.length - 1)) {
									roleLines += "," + csv["days"][i]["shifts"][shift][positionName] + "\n";
								}
							}
						}
					}
				}
				shiftLines += csv["days"][i]["shifts"][shift]["start"] + "-" + csv["days"][i]["shifts"][shift]["end"] + roleLines;
			}
			dayLines += "Day " + (i + 1) + ",\n" + shiftLines + ",\n";
		}

		csvData += dayLines;

		$("#downloadCsv").attr("href", "data:text/csv;charset=utf-8," + encodeURI(csvData));
		$("#downloadCsv").attr("download", csv["competitionName"].replace(/ /g, "_") + "_Schedule.csv");

		//This will upload the data to the server, if the user wants to
		if (window.confirm("Would you like to upload this Schedule?")) {
			var password = window.prompt("What is the password?");
			$http.post('php/insertSchedule.php', {
				password: password,
				schedule: $rootScope.build
			}).then(function (response) {
				if (response.data.error) {
					alert(response.data.error);
				}
			});
		}
	};
});

// Copyright Huascar Sanchez, 2014.
/**
 * @author Huascar A. Sanchez
 */
$(function() {

	var VERSION = "1";
	if (window.localStorage.ss_version !== VERSION) {
		delete window.localStorage.answers;
		delete window.localStorage.ss_page;
		delete window.localStorage.query;
		delete window.localStorage.cached;
		window.localStorage.ss_version = VERSION;
	}

	//https://github.com/coolaj86/knuth-shuffle
	//OR http://en.wikipedia.org/wiki/Fisher-Yates_shuffle
	function shuffle(array) {
		var currentIndex = array.length,
			temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	function parseArray(array) {
		if (!array) {
			return [];
		}

		return JSON.parse(array);
	}
	
	function drawChart(data) {
			
			data = data || [
				['Code Example', 'Typicality'],
				['1', 0.292647287636152],
				['2', 0.29199225810537754],
				['3', 0.29194597721237286],
				['4', 0.2929354020271038],
				['5', 0.2920510169277978],
				['6', 0.2911478136277486],
				['7', 0.2921536295040776],
				['8', 0.2913884440434484],
				['9', 0.2923937887190767],
				['10', 0.2928719348879969],
				['11', 0.2932117446624235],
				['12', 0.29264790351455316],
				['13', 0.2926977328883194],
				['14', 0.2925780097711295],
				['15', 0.29221171229723497],
				['16', 0.2921761394437954],
				['17', 0.2926193719831474]];	
				
		var ranked = [];
		for(var i = 1; i < data.length; i++){
		  ranked.push(data[i][1]);
		}	
			
		ranked.sort(function(a, b){
			return b - a;
		});
		
			
		var min = ranked[ranked.length - 1];
		var max = ranked[0];
		
		var data = google.visualization.arrayToDataTable(data);
		var options = {
			// title: 'Source code Typicality Scores',
			legend: { position: 'none' },
			colors: ['#333333'],
			pointSize: 5,
			
			hAxis: {
				title: 'Code Examples',
				minorGridlines: 12,
				scaleType: 'log',
				slantedText: true,  /* Enable slantedText for horizontal axis */
				slantedTextAngle: 45, /* Define slant Angle */
				gridlines: {color: '#333333', count: 4}
			},
			
			vAxis: {
				title: 'Typicality',
				minValue: min,
				maxValue: max,
				format: 'decimal'
			},
			
			chartArea: { width: 500 }
			
		};
		
		var formatter = new google.visualization.NumberFormat({ 
			pattern: '#.#################', 
			fractionDigits: 17
		});
		
		formatter.format(data, 1);
			
		var chart_div = document.getElementById('chart_div');
	  var chart = new google.visualization.AreaChart(chart_div);
		
		$(chart_div).show();
		$('#chart_div > h1').show();

	  chart.draw(data, options);
  }	

	if (!String.prototype.trim) {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}
	
	function pairwise(list) {
	  if (list.length < 2) { return []; }
	  var first = list[0],
	      rest  = list.slice(1),
	      pairs = rest.map(function (x) { return [first, x]; });
	  return pairs.concat(pairwise(rest));
	}

	function product(args) {
		if (!args.length)
			return [
				[]
			];
		var prod = product(args.slice(1)),
			r = [];
		args[0].forEach(function(x) {
			prod.forEach(function(p) {
				r.push([x].concat(p));
			});
		});
		return r;
	}
	
	function slocSyntax(sloc){
		sloc = sloc || "<9";
		
		var limit = sloc.match(/\d+/)[0] || 9;
		limit     = parseInt(limit);
		var oper  = sloc.replace(/\d+/, "") || "<";
		
		
		return {
			limit: limit,
			oper: oper
		};
	}
	
	function attsSyntax(atts){
		atts = atts || "4grams";
		
		var result = {};
		
		switch(atts){
	    case "types":
	    	result.istypes = true;
	    	break;
	    case "chars":
	    	result.ischars = true;
	    	break;	
	    case "punits":
	    	result.ispunits = true;
	    	break;	
	    default:
				if(atts.indexOf("grams") !== -1){
					var limit  = atts.match(/\d+/)[0] || 4;
					limit      = parseInt(limit);
			
					result.splits  = limit;
					result.isgrams = true;
				} else {
						throw "Sorry, we could not understand the atts.";	
				}
		}
		
		return result;
	}

	/**
	 * thx to https://github.com/peterflynn/simple-sloc-counter
	 * Counts lines of code in given text.
	 * Throws 'Unsupported' exception in cases where it's not possible to give an accurate count.
	 * @return {{total: number, sloc: number}}
	 */
	function countSloc(text) {

		var lines = text.split(/\r\n|\r|\n/);

		var codeLines = 0;
		var inBlockComment = false;
		var inString = false;
		var stringDelim;

		lines.forEach(function(line, lineNum) {

			var i;
			var sawCode = false;
			for (i = 0; i < line.length; i++) {
				var c = line[i];
				if (inBlockComment) {
					if (c === "/" && line[i - 1] === "*") {
						inBlockComment = false;
					}
				} else if (inString) {
					sawCode = true;
					if (c === stringDelim) {
						inString = false;
					} else if (c === "\\") {
						i++; // skip next char (escaped char)
					}
				} else {
					// ignore all whitespace
					if (c !== " " && c !== "\t") {
						// opening of string
						if (c === "\"" || c === "'") {
							sawCode = true;
							inString = true;
							stringDelim = c;
						} else if (c === "/") {
							// opening of comment - MAYBE
							if (line[i + 1] === "*") {
								inBlockComment = true;
								i++; // (no point in looking at the "*" again)
							} else if (line[i + 1] === "/") {
								break; // rest of line is a line comment
							} else {
								sawCode = true;

								// A "/" also might be the start of a regexp literal. Detecting regexps is INSANELY difficult in JS
								// and basically requires fully parsing the code. We care because, like a string literal, the regexp
								// could contain strings like /* or " that we'd misinterpret. (Detecting where a regexp ENDS is no
								// mean feat either, btw).
								// So, we cheat: we only care about the rest of the line if it might contain something that affects
								// how we count LATER lines. All other cases are unambiguous without us knowing whether a regexp is
								// present or not.
								if (line.indexOf("/*", i + 1) !== -1) {
									throw ("Potential block comment start following potential regular expression on same line" + lineNum);
								} else if (line.indexOf("\"", i + 1) !== -1 || line.indexOf("'", i + 1) !== -1) {
									var trimmed = line.trim();
									if (trimmed[trimmed.length - 1] === "\\") {
										throw ("Potential multi-line string literal following potential regular expression on same line" + lineNum);
									}
								}
								break; // ignore rest of line since we're not sure if it's a regexp and if so, where it ends
							}
						} else {
							sawCode = true;

							// mainly as a self-check, error out if we see a block-comment close when we think we're not in a block comment
							if (c === "*" && line[i + 1] === "/") {
								throw ("Unexpected */ when not in a block comment" + lineNum);
							}
						}
					}
				}
			}

			if (sawCode) {
				codeLines++;
			}
			if (inString && line[line.length - 1] !== "\\") {
				throw ("Unclosed string at end of line" + lineNum);
			}
		});

		if (inBlockComment) {
			throw ("Unclosed block comment at end of file");
		} else if (inString) {
			throw ("Unclosed string at end of file");
		}

		return {
			total: lines.length,
			sloc: codeLines
		};
	}

	// Compute the edit distance between the two given strings
	function editDistance(a, b) {
		if (a.length === 0) return b.length;
		if (b.length === 0) return a.length;

		var matrix = [];

		// increment along the first column of each row
		var i;
		for (i = 0; i <= b.length; i++) {
			matrix[i] = [i];
		}

		// increment each column in the first row
		var j;
		for (j = 0; j <= a.length; j++) {
			matrix[0][j] = j;
		}

		// Fill in the rest of the matrix
		for (i = 1; i <= b.length; i++) {
			for (j = 1; j <= a.length; j++) {
				if (b.charAt(i - 1) == a.charAt(j - 1)) {
					matrix[i][j] = matrix[i - 1][j - 1];
				} else {
					matrix[i][j] = Math.min(
						matrix[i - 1][j - 1] + 1, // substitution
						Math.min(matrix[i][j - 1] + 1, // insertion
							matrix[i - 1][j] + 1)); // deletion
				}
			}
		}

		return matrix[b.length][a.length];
	};

	function normalizedEditDistance(a, b) {
		var ed = editDistance(a, b) / 1.0;
		var len = Math.max(a.length, b.length) / 1.0;

		return (ed / len);
	};

	function splitString(string, search, replacement) {
		return string.split(search).join(replacement);
	};

	// Compute and return the profile of s, as defined by Ukkonen "Approximate
	// string-matching with q-grams and maximal matches".
	// https://www.cs.helsinki.fi/u/ukkonen/TCS92.pdf The profile is the number
	// of occurrences of k-shingles, and is used to compute q-gram similarity,
	// Jaccard index, etc. Pay attention: the memory requirement of the profile
	// can be up to k * size of the string
	function qGrams(string) {
		// Initialize their scores
		var shingles = new Hashtable();

		var string_no_space = splitString(string, ' ', '');
		var k = 4;
		
		if(Searcher.atts.isgrams){
			k = Searcher.atts.splits;
		}

		for (var i = 0; i < (string_no_space.length - k + 1); i++) {
			var shingle = string_no_space.substring(i, i + k);
			if (shingles.containsKey(shingle)) {
				var old = shingles.get(shingle);
				shingles.put(shingle, old + 1);
			} else {
				shingles.put(shingle, 1);
			}
		}

		return shingles;
	}

	function norm(map) {
		var agg = 0.0;
		var keys = map.keys();
		keys.forEach(function(x) {
			var old = map.get(x);
			agg += 1.0 * (Math.pow(old, 2));
		});

		return Math.sqrt(agg);
	}

	function dotProduct(a, b) {
		var small = b;
		var big = a;

		if (a.size() < b.size()) {
			small = a;
			big = b
		}

		var agg = 0;
		var keys = small.keys();
		keys.forEach(function(x) {
			if (big.containsKey(x)) {
				var bigVal = big.get(x);
				var smallVal = small.get(x);
				agg += 1.0 * (smallVal * bigVal);
			}
		});

		return agg;
	}

	function cosineSimilarity(a, b) {
		if (typeof a == 'undefined') return 0.0;
		if (typeof b == 'undefined') return 0.0;
		if (!a) return 0.0;
		if (!b) return 0.0;

		if (a == b) return 1.0;
		if (a.length < 3 || b.length < 3) return 0.0;

		var qGrams1 = qGrams(a);
		var qGrams2 = qGrams(b);
		
		return (1.0 * (dotProduct(qGrams1, qGrams2)) / (norm(qGrams1) * norm(qGrams2)));
	}

	function distance(a, b) { // a and b are strings
		if(Searcher.atts.isgrams || Searcher.atts.istypes || Searcher.atts.ispunits){
			return 1.0 - cosineSimilarity(a, b);
		} else {
			return 1.0 - (editDistance(a, b) / 1.0);
		}
	}

	function sum(array) {
		var num = 0;
		for (var i = 0, l = array.length; i < l; i++) {
			num += array[i];
		}

		return num;
	}

	function mean(array) {
		return sum(array) / array.length;
	}

	function computeVariance(array) {
		var m = mean(array);
		return mean(array.map(function(num) {
			return Math.pow(num - m, 2);
		}));
	}
	
	function computeRadius(ranked) {
		
		var m = ranked[0];
		var r = record[1];
		var distances		= [];
		
		mapObj.keys().forEach(function(x){
			var y = mapObj.get(x).code;
			distances.push(distance(mostTypical.code, y));
		});
		
		return mean(distance);
	}	

	function computeStandardDeviation(variance) {
		return Math.sqrt(variance);
	}
	
	// Scale pdf by constant c
  function scale(x, y, estimator, variance, c) {
		variance = variance * c * c;
    return pdf(x, y, estimator * c, Math.sqrt(variance));
  };
	
	// Probability density function
  function pdf(x, y, estimator, standardDeviation) {
    var m = standardDeviation * Math.sqrt(2 * Math.PI);
		var d = distance(x, y);
    var e = Math.exp(-Math.pow(d, 2) / (2 * estimator));
    return e / m;
  };

	// probabilityDensityFunction
	function probabilityDensityFunction(x, y, estimator, nconst) {
		var a = 1.0 / (Math.sqrt(2 * Math.PI) * (nconst) /*normalized constant*/);
		var d = distance(x, y);
		var h = 2 * estimator;
		var e = Math.exp(-(Math.pow(d, 2) / Math.pow(h, 2)));
		return (a * e);
	};

	var CLASS_PATTERN = /class[^;=\n]*\s[\S\s]*?(?={)/;
	var METHOD_PATTERN = /^\s*?(((public|private|protected|static|final|native|synchronized|abstract|threadsafe|transient)\s+?)*)\s*?(\w+?)\s+?(\w+?)\s*?\(([^)]*)\)[\w\s,]*?(?={)?\s*?/;

	function wrapCodeIfNeeded(code) {
		var hasClass = code.match(CLASS_PATTERN);
		var hasMethod = code.match(/(?:(?:public)|(?:private)|(?:static)|(?:protected)\s+)*/);

		if (!hasMethod) {
			code = "public void static main(String... args){\n" + code + "\n}";
			if (!hasClass) {
				code = "class CodeExample {\n" + code + "\n}";
			}
		} else if (!hasClass) {
			code = "class CodeExample {\n" + code + "\n}";
		}

		return code;
	}

	function getObjects(obj, key, val) {
		var objects = [];
		for (var i in obj) {
			if (!obj.hasOwnProperty(i)) continue;

			if (typeof obj[i] == 'object') {
				objects = objects.concat(getObjects(obj[i], key, val));
			} else if (val.some(type => type === obj[i])) {
				objects.push(obj);
			} else if (Array.isArray(obj[key])) {
				for (let item of obj[key]) {
					objects = objects.concat(getObjects(item, key, val));
				}
			}
		}

		return objects;
	}
	
	function getAllProgramUnits(result){

		var interested = ["IfStatement", "BlockStatements", "WhileStatement", "DoStatement", "LabeledStatement", "InfixExpression", "EnhancedForStatement", "ForStatement", "TryStatement", "LocalVariableDeclarationStatement", "VariableDeclarationStatement", "SwitchStatement", "SynchronizedStatement", "ReturnStatement", "ThrowStatement", "BreakStatement", "ContinueStatement", "EmptyStatement"];
		var allStatements = getObjects(result, 'node', interested);
		var allStatementNames = new Set();
		
		allStatements.forEach(function(x) {
			allStatementNames.push(x.node);
		});
		
		return Array.from(allTypeNames);
	}

	function getAllTypes(result){

		function isFirstLetterCapital(value) {
			if (!value) return false;
			return value.charAt(0) === value.charAt(0).toUpperCase();
		}

		var interested = ["SimpleType", "ImportDeclaration", "TypeDeclaration", "PrimitiveType", "ParameterizedType", "ArrayType"];
		var allTypes = getObjects(result, 'node', interested);

		var allTypeNames = new Set();
		allTypes.forEach(function(x) {
			if (x.name) {
				if ("Package" != x.name.identifier) {
					allTypeNames.add(x.name.identifier);
				}
			} else if (x.primitiveTypeCode) {
				if ("void" != x.primitiveTypeCode) {
					allTypeNames.add(x.primitiveTypeCode);
				}
			} else if (x.componentType) {
				if (x.componentType.primitiveTypeCode) {
					if ("void" != x.componentType.primitiveTypeCode) {
						allTypeNames.add(x.componentType.primitiveTypeCode);
					}
				} else if (x.componentType.name) {
					if ("void" != x.componentType.name.identifier) {
						allTypeNames.add(x.componentType.name.identifier);
					}
				}
			}
		});

		return Array.from(allTypeNames).filter(isFirstLetterCapital);
	}

	function extractCodeFeatures(code) {
		var result = parseJava(code);
		if(Searcher.atts.istypes){
			return getAllTypes(result);
		} else if(Searcher.atts.ispunits){
			return getAllProgramUnits(result);
		} else {
			return [];
		}
	}

	function parseJava(code /*plain text*/ ) { // returns a JSON object
		if (!code) return false;

		code = wrapCodeIfNeeded(code);

		try {
			var result = JavaParser.parse(code);
			// var str		 = JSON.stringify(result, null, 4);

			if (result) {
				return result;
			} else {
				throw "Unable to process compilation unit";
			}
		} catch (err) {
			throw err;
		}
	}

	function isBlock(code /*<code> element*/ ) {
		if (!code) return false;

		var $code = $(code);

		// if it's less than 5 lines of code, we don't treat it as a suitable
		// code block
		var text = $code.text();
		
		// check if text is Java and compilable code
		
		var limit = Searcher.sloc.limit || 8;
		limit     = parseInt(limit);
		var oper  = Searcher.sloc.oper  || '<=';

		var isValid = false;
		try {
			var sloc = countSloc(text).sloc;
			switch (oper) {
			  case '<':
					if (sloc < limit) return false;
					break;
				case '<=':
					if (sloc <= limit) return false;
					break;	
				default:
					throw "Sorry, we could not understand the operator.";	
			}
			
			// var sloc = countSloc(text).sloc;
			// if (sloc <= 8) return false;
			
			parseJava(text);
			// No error
			isValid = true;
		} catch (err) {
			isValid = false;
		}

		return isValid;
	}

	function toString(codes) {
		var blocks = [];

		codes = codes || [];

		for (var idx = 0; idx < codes.length; idx++) {
			var code = codes[idx];
			blocks.push($(code).text());
		}

		return blocks;
	}

	function validBlocks(codes) {
		var blocks = [];

		codes = codes || [];

		for (var idx = 0; idx < codes.length; idx++) {
			var code = codes[idx];

			if (isBlock($(code))) {
				blocks.push(code);
			}
		}

		if (blocks.length == 0) return blocks;

		var longest = blocks.reduce(function(a, b) {
			return a.length > b.length ? a : b;
		});
		var result = [];

		result.push(longest);

		return result;
	}
	
	
	function roundTo(num, decimals){
		var shift = Math.pow(10, decimals);
		return Math.round(num * shift) / shift;
	};
	
	
	function showGaussianKernels(tableView/*hashtable*/, winner){
		setTimeout(function() {
			
			var hcols = tableView.keys();
			var hrows = hcols.concat();
			
			var gausstable = $("#GaussianKernel > tbody"); // HTML DOM object
			
			var header = $('<tr>');
			header.append('<td></td>');
			hcols.forEach(function(l){
				header.append($('<th scope="col">' + l + '</th>'));
			});
			
			gausstable.append(header);
			
			var allRows = [];
			hrows.forEach(function(row, idx){
				var i = row;
				var val = tableView.get(i); // hashtable({id -> score})
				
				var newRow = (winner === i) ? $('<tr>').addClass('highlight') : $('<tr>');
				var rlbl = $('<th scope="row">' + i + '</th>');
				newRow.append(rlbl);
				
				hcols.forEach(function(col){
					var j = col;
					
					if(i === j){ // add zero
						newRow.append($('<td>' + 0.0 + '</td>'));	
					} else {
						var score = val.get(j) || 0.0;
						newRow.append($('<td>' + score + '</td>'));	
					}
					
				});
				
				allRows.push(newRow);
			});
			
			allRows.forEach(function(each){
				gausstable.append(each);
			});
			
			
			gausstable.show();
			
			setTimeout(function() {
				drawChart();
			}, 230);
						
		}, 230);
	}

	function isEmpty(blocks) {
		return (blocks === undefined || blocks.length == 0)
	}

	function ensureCleanSlate(query) {
		query = query.trim();
		if (window.localStorage.query !== query) {
			delete window.localStorage.answers;
			delete window.localStorage.ss_page;
			delete window.localStorage.query;
			delete window.localStorage.cached;
			window.localStorage.ss_confirmed = false;
			Searcher.answers = [];
			Searcher.page = 1;
			Searcher.item = 0;
			Searcher.candidates = [];
			Searcher.stop = false;

			window.localStorage.ss_version = VERSION;
			window.localStorage.query = query;
		}
	};

	function orderedHash() {
		var keys = [];
		var vals = {};
		var idxs = {};

		return {
			clear: function() {
				keys = [];
				vals = {};
				idxs = {};
			},

			push: function(k) {
				this.put(k, k);
			},

			put: function(k, v) {
				if (!vals[k]) {
					keys.push(k);
					idxs[k] = keys.length - 1;
				}
				vals[k] = v;
			},

			empty: function() {
				return this.length() == 0;
			},

			val: function(k) {
				return vals[k]
			},

			length: function() {
				return keys.length
			},

			keys: function() {
				return keys
			},

			values: function() {
				return vals
			}
		};
	};

	function toAnswerArray(orderedHash) {
		if (!orderedHash) return [];

		var allKeys = orderedHash.keys();
		var N = allKeys.length;
		var result = [];
		for (var idx = 0; idx < N; idx++) {
			var key = allKeys[idx];
			result.push(orderedHash.val(key));
		}

		return result;
	};


	// Setup the main controller
	var Searcher = {
		page: window.localStorage.ss_page || 1,
		item: 0,
		answers: parseArray(window.localStorage.answers),
		candidates: [],
		api: 'http://api.stackexchange.com/2.2/',
		stop: false,

		reset: function() {
			Searcher.item = 0;
			$('#output').val('');
			$('#logger').empty().append($('<div>', {
				class: 'oc',
				text: 'search console'
			}));
			$('#displayer').empty().append($('<div>', {
				class: 'oc',
				text: 'selection console'
			}));
			$('#search').attr('disabled', false).text('SEARCH');
			$("input").prop('disabled', false);
			$('.done').hide();
		},

		logger: function(text, class_suffix, to_append) {
			var $div = $('<div>', {
				'html': text,
				'class': 'log-' + class_suffix
			});

			//noinspection JSJQueryEfficiency
			$('#logger').append($div);

			if (to_append) {
				$div.append(to_append);
			}

			//noinspection JSJQueryEfficiency
			$('#logger')[0].scrollTop = $('#logger')[0].scrollHeight;
		},

		displayer: function(text, class_suffix, to_append, extra) {
			var $div = $('<div>', {
				'html': text,
				'class': 'disp-' + class_suffix
			});

			//noinspection JSJQueryEfficiency
			$('#displayer').append($div);

			if (to_append) {
				$div.append(to_append);
			}
			
			if(extra){
				$div.append(extra);
			}

			//noinspection JSJQueryEfficiency
			$('#displayer')[0].scrollTop = $('#displayer')[0].scrollHeight;
		},

		listCandidate: function(message) {
			if (message) {
				Searcher.displayer(message, "item");
			}
		},

		logError: function(reason) {
			if (reason) {
				Searcher.logger(reason, "error");
			}

			Searcher.item++;
			Searcher.search();
		},

		nextAnswer: function(message) {
			if (message) {
				Searcher.logger(message, "success");
			}

			Searcher.item++;
			Searcher.search();
		},

		computeCodeTypicality: function() {

			Searcher.displayer("Sampling code examples by typicality.", "info");

			// Output!
			setTimeout(function() {

				// Get the variance and standard deviation
				var variance = Searcher.variance;
				var standDev = Searcher.standDev;

				// Compute kernel estimator or bandwidth
				var kernelEstimator = Searcher.kernelEstimator;

				var entries = [];
				var candidateArray = Searcher.candidateArray;

				// Get all entries
				var idx;
				for (idx = 0; idx < candidateArray.length; idx++) {
					
					var answerObject = candidateArray[idx];
					var answer_id = answerObject.answer_id;
					var answer_score = answerObject.score;
					var link = answerObject.link ? answerObject.link : answerObject.href;
					var code = answerObject.code;
					
					// e.g., types, loop structures, parameter arity
					var feats = extractCodeFeatures(wrapCodeIfNeeded(code));

					var entry = {
						"title": answerObject.title,
						"href": link,
						'target': '_blank',
						"code": code,
						"answer_id": answer_id,
						"features": feats
					};

					entries.push(entry);
				}

				// Initialize their scores
				var T = new Hashtable();
				var S = new Hashtable();
				
				// data (set of objects) to be displayed on a table
				var Comparissons = new Set();

				for (idx = 0; idx < entries.length; idx++) {
					var e = entries[idx];
					T.put(e, 0.0);
				}
				
				function skipComparisson(hashtable, si, sj){
					if(hashtable.containsKey(si.answer_id)){
						if(hashtable.get(si.answer_id).has(sj.answer_id))  { 
							return true; 
						} else {
							hashtable.get(si.answer_id).add(sj.answer_id);
						}
					} else if (hashtable.containsKey(sj.answer_id)){
						if(hashtable.get(sj.answer_id).has(si.answer_id)) { 
							return true; 
						} else {
							hashtable.get(sj.answer_id).add(si.answer_id);
						}
					}
	
					
					return false;
				}
				
				function getAttributes(obj){
					var cobj = obj.code;
					
					if(Searcher.atts.istypes || Searcher.atts.ispunits){
						cobj = obj.features.join("\n");
					} 
					
					return cobj;
				}

				// Compute each entry's typicality score
				var array = [];
				array.push(entries);
				array.push(entries);
							
				var cartesian = product(array);
				
				for (idx = 0; idx < cartesian.length; idx++) {
					var pair = cartesian[idx];

					var si = pair[0];
					var sj = pair[1];

					// if(si.answer_id === sj.answer_id) continue;
// 					if(skipComparisson(S, si, sj))    continue;
					
					var ci = getAttributes(si);
					var cj = getAttributes(sj);
					
					var w = pdf(ci, cj, kernelEstimator, standDev);
					
					// capture data
					Comparissons.add({a: si.answer_id, b: sj.answer_id, c: w});
										
					var Tsi = T.get(si) + w;
					var Tsj = T.get(sj) + w;

					T.put(si, Tsi);
					T.put(sj, Tsj);
				}

				// Sorts entries on their typicality score				
				var sortable = [];
				T.keys().forEach(function(x){
					var y = T.get(x);
					sortable.push([x, y]);
				});
				

				sortable.sort(function(a, b) {
					return b[1] - a[1];
				});
				
				
				// Thinning number of search results
				var to = sortable[0];
				var scores = [];
				sortable.forEach(function(x){
					scores.push(to[1] - x[1]);
				});
				
				var radius = mean(scores);
				
				// HACK
				var chartdata = [];
				chartdata.push(['Code example', 'Typicality']);
				var chosen = new Hashtable();
				for (idx = 0; idx < sortable.length; idx++) {
					var t = sortable[idx][1];
					
					if((to[1] - t) > radius) continue;
					
					var s = sortable[idx][0];

					var answer_id = s.answer_id;
					
					chosen.put(answer_id, answer_id);
					
					//chartdata.push([answer_id.toString(), t]);
					
					var answer_score = s.score;
					var link = s.link ? s.link : s.href;
					var code = s.code;

					Searcher.displayer("Code example ", "trying", $('<a>', {
						'text': answer_id,
						'href': link,
						'target': '_blank'
					}));

					Searcher.listCandidate("typicality score: " + t);
				}
			
				// display only the typical ones
				var compatibleOnes = Array.from(Comparissons).filter(x => chosen.containsKey(x.a));
				var tableView = new Hashtable(); // hashtable of sets
				compatibleOnes.forEach(function(d){
					if(tableView.containsKey(d.a)){
						tableView.get(d.a).put(d.b, d.c);
					} else {
						var val = new Hashtable();
						val.put(d.b, d.c);
						tableView.put(d.a, val);
					}
				});
				
				T.keys().forEach(function(k){
					chartdata.push([k.answer_id.toString(), parseFloat(T.get(k))]);
				});
				
				setTimeout(function(){
					drawChart(chartdata);
				}, 230);

				$('#search').attr('disabled', false).text('Again?');
				$("input").prop('disabled', false);
				Searcher.wait(false);
				Searcher.item++;
				setTimeout(function() {
					$('.done').fadeIn();
				}, 400);

			}, 230); // Don't freeze up the browser
		},

		foundCandidates: function() {
			Searcher.logger("Found enough suitable code examples", "success");

			Searcher.displayer("Fetching code examples", "trying");
			Searcher.displayer("Downloading code examples, ready to try.", "info");
		},

		fetchCandidates: function() {

			// Output!
			setTimeout(function() {
				// TODO(Huascar) delete this and all its references throughout the code
				var k = $("#topk").val();

				var candidates = [];
				if (Searcher.candidates.length == 0) {
					candidates = parseArray(window.localStorage.cached).items;
				} else {
					candidates = Searcher.candidates;
				}

				var cached = [];

				var shuffledArray = candidates;

				for (var idx = 0; idx < candidates.length; idx++) {
					var answerObject = shuffledArray[idx];
					var answer_id = answerObject.answer_id;
					var answer_score = answerObject.score;
					var link = answerObject.link ? answerObject.link : answerObject.href;
					var code = answerObject.code;

					Searcher.displayer("Code example ", "trying", $('<a>', {
						'text': answer_id,
						'href': link,
						'target': '_blank'
					}));

					var entry = {
						"title": answerObject.title,
						"href": link,
						'target': '_blank',
						"code": code,
						"answer_id": answer_id
					};

					cached.push(entry);

					Searcher.listCandidate("Code example candidate");
				}

				var cachedCandidates = {
					"items": cached
				};

				window.localStorage.setItem("cached", JSON.stringify(cachedCandidates));

				$('#search').attr('disabled', false).text('Again?');
				$("input").prop('disabled', false);
				Searcher.wait(false);
				Searcher.item++;
				setTimeout(function() {
					$('.done').fadeIn();
				}, 400);

				Searcher.candidates = []; // clear array

			}, 230); // Don't freeze up the browser
		},

		nextPage: function() {
			if (parseInt(Searcher.page) >= 7) {
				Searcher.logger("Out of answers from StackOverflow!", "out");
				$('#search').attr('disabled', false).text('Again?');
				Searcher.wait(false);				
				return false;
			}

			Searcher.logger("Fetching page " + Searcher.page + "...", "trying");

			var query = Searcher.query;	
			var splits = query.split(/[ ,]+/);
			
			// stemm query and used use nouns as tags
			var noStemmedQ	= new Set(splits);
			var stemmedQ		= new Set(splits.map(function(x){ return stemmer(x) }));
			
			var tagsQ = [];
			stemmedQ.forEach(function(x){
				if(noStemmedQ.has(x)){
					tagsQ.push(x);
				}
			});
			
			var tagsQtext = "java;";// + tagsQ.join(";")
			
			
			var uquery = splits.join("+");
			var encoded = encodeURIComponent(query);

			// search/advanced?todate=1471910400&order=desc&sort=relevance&q=quick%2Bselect&accepted=True&notice=False&tagged=java&site=stackoverflow
			var common_url = '&pagesize=100&order=desc&site=stackoverflow&fromdate=960508800&todate=1496880000';
			var question_url = Searcher.api + 'similar?' + 'sort=relevance&closed=False&accepted=True&notice=False&tagged=java&title=' + encoded + '&page=' + Searcher.page + common_url;

			var titles = {};

			var relevantOrder = orderedHash();

			$.getJSON(question_url, function(data_questions) {
				var answer_ids = [];
				$.each(data_questions['items'], function(k, v) {
					if (v.accepted_answer_id) {
						answer_ids.push(v.accepted_answer_id);
						titles[v.question_id] = v.title;
						relevantOrder.push(v.accepted_answer_id);
					}
				});

				// it looks 
				//var answer_url = Searcher.api + 'answers/' + answer_ids.join(';') +
				//'?sort=activity&filter=!9hnGsyXaB' + common_url;

				var answer_url = Searcher.api + 'answers/' + answer_ids.join(';') + '?filter=!9hnGsyXaB' + common_url;
				$.getJSON(answer_url, function(data_answers) {
					Searcher.logger("Answers downloading, ready to check.", "success");
					$.each(data_answers['items'], function(k, v) {
						
						relevantOrder.put(v.answer_id, {
							'answer_id': v.answer_id,
							'question_id': v.question_id,
							'link': 'http://stackoverflow.com/questions/' + v.question_id + '/#' + v.answer_id,
							'body': v.body,
							'score': v.score,
							'title': titles[v.question_id] || ""
						});
					});

					var candidates = toAnswerArray(relevantOrder).filter(function(x){
						return isNaN(x);
					});
					Searcher.answers = Searcher.answers.concat(candidates);

					// Save the new answers
					window.localStorage.answers = JSON.stringify(Searcher.answers);

					Searcher.page = parseInt(Searcher.page, 10) + 1;
					window.localStorage.ss_page = Searcher.page;

					Searcher.search();
				});
			});
		},

		search: function() {
			if (Searcher.stop) {
				Searcher.logger("Stopped by user", "out");
				$('#search').attr('disabled', false).text('Again?');
				$("input").prop('disabled', false);
				Searcher.wait(false);
				Searcher.stop = false;
				Searcher.reset();
				return false;
			}

			Searcher.stop = false;

			if (Searcher.item >= Searcher.answers.length) {
				Searcher.nextPage();
				return false;
			}

			$('.done').hide();

			Searcher.wait(true);

			// Output!
			setTimeout(function() {
				var answer_id = Searcher.answers[Searcher.item].answer_id;
				var link = Searcher.answers[Searcher.item].link;

				Searcher.logger("Checking code example ", "trying", $('<a>', {
					'text': answer_id,
					'href': link,
					'target': '_blank'
				}));

				Searcher.examineAnswer();

			}, 230); // Don't freeze up the browser
		},

		examineAnswer: function() {
			var answer	= Searcher.answers[Searcher.item].body;
			var title		= Searcher.answers[Searcher.item].title;
			
			var query		= Searcher.query;
			
			var splitQ	= new Set(query.split(/[ ,]+/).map(function(x){ return stemmer(x.toLowerCase()) }));
			var splitT	= new Set(title.split(/[ ,]+/).map(function(x){ return stemmer(x.toLowerCase()) }));
			
			function intersection(setA, setB) {
				var intersection = new Set();
				for (var elem of setB) {
						if (setA.has(elem)) {
							intersection.add(elem);
						}
			  }
				
				return intersection;
			}
			
			
			if (intersection(splitQ, splitT).size > 0){
				var codes = answer ? answer.match(/<code>(.|[\n\r])*?<\/code>/g) : [];

				var blocks = validBlocks(codes);
				if (!isEmpty(blocks)) {
					if ((parseInt(Searcher.page) >= 6) || (Searcher.candidates.length >= 20)) {
						Searcher.foundCandidates();
						Searcher.fetchCandidates();
					} else {
						var item = Searcher.answers[Searcher.item];
						item.code = toString(blocks).join("\n");

						Searcher.candidates.push(item);
						Searcher.nextAnswer("Found a valid code example");
					}
				} else { // no valid code found
					Searcher.logError("Invalid Java code example");
				}	
			} else {
				Searcher.logError("Invalid Java code example");
			}

		},

		wait: function(state) {
			$('.sad-waiter').css({
				height: state ? 137 : 0
			}).find('.hour, .minute').css({
				display: state ? 'block' : 'none'
			});
			$('#stopper').toggleClass('hide', !state);
		},

		setupConsoles: function() {
			$('#logger').empty().append($('<div>', {
				class: 'oc',
				text: 'search console'
			}));
			$('#displayer').empty().append($('<div>', {
				class: 'oc',
				text: 'selection console'
			}));
		}
	};

	Searcher.wait(false);
	Searcher.setupConsoles();
	$(document.getElementById('chart_div')).hide();

	$('#search').click(function() {
		
		var options = {keywords: ['atts', 'sloc']};
		var sreq = parseSReq($("#query").val(), options);
		
		// Extract values from SREQ objects
		Searcher.sloc = slocSyntax(sreq.sloc); // object with limit (num) and oper attributes (str)
		Searcher.atts = attsSyntax(sreq.atts)  // object w/tests to specific qualifiers; e.g., istypes?
		
		var query		= (typeof sreq == 'string' || sreq instanceof String) ? sreq : sreq.text;

		if (!query) {
			alert("Please provide a query");
			$("#query").focus();

			return false;
		}

		ensureCleanSlate(query);
		
		// caches query
		Searcher.query = query;
		
		// Disclaimer
		// TODO: Use better modal?
		var warn = "Ready for fetching arbitrary Java code examples from StackOverflow?";
		var ready = window.localStorage.ss_confirmed || confirm(warn);

		if (!ready) {
			return false;
		}

		window.localStorage.ss_confirmed = true;

		Searcher.reset();

		$('#search').attr('disabled', true).text('Search');
		$("input").prop('disabled', true);
		$('#logger').find('.oc').remove();
		$('#displayer').find('.oc').remove();
		$("input[type=checkbox]").prop("checked", false);
		Searcher.stop = false;

		Searcher.search();
	});

	$('#stop').click(function() {
		Searcher.stop = true;
		return false;
	});

	var checkboxes = $("input[type=checkbox]");
	checkboxArray = Array.from(checkboxes);

	function confirmCheck() {
		$('#displayer').empty();
		if (this.checked) {
			setTimeout(function(){
						
				var query		= $("#query").val();

				if (!query) {
					alert("Please provide a query");
					
					checkboxArray.forEach(function(checkbox) {
						$(checkbox).attr('checked', false);
					});
					
					$("#query").focus();					
					
					return;
				} else {
					var candidates = [];
					if (Searcher.candidates.length == 0) {
						candidates = parseArray(window.localStorage.cached).items;
					} else {
						candidates = Searcher.candidates;
					}
				
					Searcher.candidateArray = candidates;
				
					// Get all source code lines of code
					var sizes = [];
					candidates.forEach(function(val) {
						sizes.push(countSloc(val.code).sloc);
					});

					// Compute their variance and standard deviation
					Searcher.variance = computeVariance(sizes);
					Searcher.standDev = computeStandardDeviation(Searcher.variance);
					// Compute kernel estimator or bandwidth
					Searcher.kernelEstimator = (1.06 * Searcher.standDev) / Math.pow(sizes.length, (1.0 / 5));
				
					setTimeout(function(){
						Searcher.computeCodeTypicality();
					});
				}
				
				
			}, 230);
		} else {
			$("#GaussianKernel > tbody").hide();
			$(document.getElementById('chart_div')).hide();
			Searcher.fetchCandidates();
		}
	}

	checkboxArray.forEach(function(checkbox) {
		checkbox.addEventListener('change', confirmCheck);
	});

});

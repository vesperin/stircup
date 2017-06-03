---
home: true
layout: default
title: Stircup app
description: Source code typicality analyzer
---

{% include centered.html text="Source code typicality analyzer"%}

It's easy to get started with **Stircup**. You use it by first entering a query, and then pressing the **Search** button below. Behind the scenes, **Stircup** fetches a few batches of code examples from StackOverflow, ranked by significance to your query, ignores those ones that don't match some user given criteria, and then displays the top k most relevant ones. We compute _k_ like this: <span><img align="center" src="https://tex.s2cms.ru/svg/k%20%3D%20%7B%5Cleft%20%5Clceil%20%20%5Csqrt%7B%7Cresults%7C%7D%20%20%5Cright%20%5Crceil%7D" alt="k = {\left \lceil \sqrt{|results|} \right \rceil}." /></span>

The used criteria include: only Java and compilable code. The final result is either a list of k most relevant according StackOverflow's ranking or a list of k most typical results if the Rank results by typicality checkbox is checked.

The first time you use it, the results get cached on your browser. After that, every time you search, this is done on your computer.

<div id="columns">
    <div id="left-col">
        <h4>
					<span class="searcher">
						<input 
							id="topk" style="width: 20px;" type="hidden" placeholder="10..." value="10" 
							onkeypress='return event.charCode >= 48 && event.charCode <= 57'/>
						<input id="query" style="width: 220px;vertical-align:middle;padding:3px;" type="text" placeholder="Search.." />						
						<button class="octicon-button dark" id="search">SEARCH</button>
					</span>
				</h4>
        <div id="logger"></div>
        <div id="stopper" class="hide">
           Had enough? <a href="#" id="stop">Stop it!</a>
        </div>
    </div>
</div>
<div id="right-col">
		<h4 style="font-family: Courier, monospace;font-size: 1.6rem;">Rank results by <span class="searcher"><input type="checkbox" id="sorting" value="typical"/><span class="typicality">Typicality</span></span></h4>
    <div id="displayer"></div>
</div>
<div id="clear"></div>

Thank you for trying this app.
---
home: true
layout: default
title: Stircup app
description: Source code typicality analyzer
---

{% include centered.html text="Source code typicality analyzer"%}

It's easy to get started with **Stircup**. You use it by first entering a query, and then pressing the **Search** button below. Behind the scenes, **Stircup** fetches a few pages of code examples from StackOverflow using StackExchange's '/similar?' command[^1], ignores those ones that don't match our results criteria[^2], and then returns a results list, which can be further introspected using source code typicality analysis.

The first time you use **Stircup**, the generated results will get cached on your browser. After that, every time you search (_using the same query_), this search is done on your computer.

### Demonstration Structure

	1. Enter the following query "Http server".
	2. Click on the search (and then wait for results)  
	2.1 Selection console displays 17 results. 
	3. Check the Typicality checkbox
	3.1 Selection console displays 9 most typical results
	3. A chart containing typicality scores for all in 2.1. 

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
		<h4 style="font-family: Courier, monospace;font-size: 1.6rem;">Sample results by <span class="searcher"><input type="checkbox" id="sorting" value="typical"/><span class="typicality">Typicality</span></span></h4>
    <div id="displayer"></div>
</div>
<div id="clear"></div>

# Source code Typicality scores

<!-- After performing source code typicality analysis over the generated results,
you will see a table below, which will show the likelihood of typical
code examples of being together in the returned result set. __Compatibility
calculations of atypical code examples are not displayed in this table__.
The most typical code example will be highlighted on the table. Horizontal
scrolling may be needed to uncover more results.

<div style="width: 100%; overflow: auto; font-size:60%;">
	<table id='GaussianKernel' class="kernel">
		<tbody style="display:none">
		</tbody>
	</table>
</div> -->

After performing source code typicality analysis over all the generated 
results (by checking the Typicality checkbox), you will see below an area 
chart displaying the typicality scores of all the generated results. Thick 
circles are typical code examples and thin circles are atypical ones. 

<center><div id="chart_div"></div></center>

Thank you for trying this app.

[^1]: It returns questions which are similar to a hypothetical one based on one's query and tag combination (e.g., _java_ tag) 

[^2]: For pragmatic reasons, our results criteria include: only permit Java and compilable code is permitted. Future versions of **Stircup** will handle partial and complete Java programs.  
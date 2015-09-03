# Dust and Magnet d3 Implementation #

Dust and magnet is a [data visualization technique introduced by Dr. John Stasko at Georgia Tech](http://www.cc.gatech.edu/gvu/ii/dnm/). 

## Premise ##

The purpose of dust and magnet is to represent multivariate data using the prinicles of iron filings and magnets.

Basically, each data point is represented as a particle and each property of the data point is represented as a magnet.

![dust in blue, magnets in black](https://www.dropbox.com/s/myzbmvhres6pf71/Screenshot%202015-05-30%2015.01.11.png?dl=1)

When activated, the dust particles to the magnets depending on the relative magnitude of the magnet's property of the dust.

## Example ##

Here, the dust are cars and the magnets are numerical properties of the cars such as highway mpg, price, city mpg etc. When the
highway mpg magnet is selected, the dust rearrange themselves so that the ones with low highway mpg are further away from the 
highway mpg magnet than those that have a high highway mpg.

![](https://www.dropbox.com/s/z4w46cf3ct5qjp6/Screenshot%202015-05-30%2015.11.13.png?dl=1)

What is cool is that when more magnets are added, the data will automatically rearrange as well thereby allowing a user to view
multivariate relationships within the data!

## Demo ##

To view the demo I have prepared go http://www.koushikk.me/d3-dust-and-magnet

To view details on a dust particle or magnet, hover over it. Double click a magnet to select it/ unselect it.

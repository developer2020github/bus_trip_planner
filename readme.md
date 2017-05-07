
## Project title
###### [Bus trip planner demo](http://developer2020github.github.io/bus_trip_planner/dist/ "link to project page")
Author: developer2020 (<dev276236@gmail.com> )
2016

## Project overview
Bus trip planner is a personal/portfolio/learning project,  designed and implemented by  developer2020 (<dev276236@gmail.com> ).  The one-page application helps user to determine which destinations in the city are reachable by bus, and shows a route: walking directions from source to start of trip bus stop, line connecting source and destination stops, and walking directions from destination stop to  actual destination. It uses Google Maps, but also provides a limited functionality without Internet connection: all necessary calculations are done locally.

City covered in the current version is  Abu Dhabi: Abu Dhabi  has a decent public transit system, but at the time when I started the application maps were not very user friendly. Now there is an official bus trip
planner, with a very good GUI, so this project remains personal/demo project. Additionally, this application presents a slightly different approach to planning: user is presented with list of important objects reachable from a source (i.e. does not need to know beforehand to which stop he needs to go to: if user wishes to reach a shopping mall, she will be presented with all malls reachable from a particular starting point).
Application can be easily modified to be used for any other city.

One of the steps meets requirements of one of Udacity front end nano-degree projects, so application was used for that purpose as well.

## Built with (libraries/technologies/APIs used)
##### Application itself:

* Knockout
* jQuery
* Google Maps
* AJAX
* Panoramio (API is disabled (was ok when application was created), working on an alternative)

##### Build process:

* Gulp
* Bower


### Important limitations:
1) Since this is a demo project, there is a limited set of sources and destinations, picked by developer2020 based on his knowledge of the city of Abu Dhabi. However, there are no design  limitations on scalability, so more can be added.
2) Current version uses Python script to generate bus routes/map objects data from Excel spreadsheets.While not perfect, this approach serves the purpose of easily  populating data for a demo and allows for an easy creation of personalized versions of the planner.

### Running the application

You do not need to rebuild the application to check it out (built version is provided), just get it from GuitHub and open index.html, located in dist sub-folder with a browser.

### Functionality

There are 4 steps in the trip planning:
###### Step 1
Program starts with loading starting points of a possible bus trip (step 1).
For this version of the application only three starting points (sources)are available - all are residential communities. Selection of sources was made based on my knowledge of the city and bus routes.
Sources are marked with green markers with "S".
User can select a desired source by clicking on the marker, clicking on the source name or typing source name in  the text input area. Once source has been selected, user can click on next step button and  application will transition to step 2.

###### Step 2
Step 2  shows selected source and all destinations, available from that selected source. Destination is considered  to be available from a source if
1) there is a bus stop in less than 2000 m (straight line)from source
2) there is a bus stop in less than 2000 m from destination
3) there is a bus route that connects these two stops.
Destinations are shown by blue markers with "D".
Current version of the application has 3 bus routes and a total of 18 destination objects. User should end up selecting one destination same way she selected source in step1.
Once this is done, user can click on the next button to transition to step 3.

###### Step 3
Step 3 shows a list of bus routes which can take user from source to destination. In current version  of the program this step is not very informative - there is no obvious distinction between routes.  Step 3 is there at all because I am considering  adding more functionality to it in the future.
Once route is selected, user can click on the next button, to move to the next step.

If during transition from step 2 to step 3 it is determined that there is only one bus route available for a selected source - destination pair - step 3 is skipped.

###### Step 4
Step 4 shows :
* a blue line connecting source bus stop with destination bus stop
* Google maps walking directions (in green)from source starting point to source bus stop and from destination bus stop to the final destination.


###### Error handling
If map is not available from the beginning, program will display a warning. However, trip planning can still be done. If connection is lost at final step, walking directions will be displayed as straight lines.

The idea behind not showing exact bus route is that  trip planner is meant to help in walking directions, it does not really matter how exactly bus gets from a to b.

From step 4, user can choose to start a new trip.
In steps 2 and 3 user can go to previous step.

Details on how distances are calculated, etc. can be found in the comments to the code.


#### Installing all the source and rebuilding the application.

Application utilizes Bower for package management and Gulp for builds.
There are two main sub-folders:
src - sources with all libraries
dist - built application.

To ensure all the required components are installed:  
0. Ensure you have node. js and npm installed.  
Refer to https://docs.npmjs.com/getting-started/installing-node for installation instructions.  
1. Get all the code from GitHub.  
2. Ensure you have Bower installed. Please refer  to http://bower.io/ for Bower installation instructions.  
3. Please navigate to src sub-folder. Run command "bower install".  
This should create bower_components sub-folder and download all dependencies.  
4. Navigate one level up (into the main directory). Run command
"npm install". This will download and install all the gulp packages required for builds.  


To re-build the application:  
1) start command line in main directory.  
2) execute command  
"gulp build"  
This will clean up files in dist directory and rebuild the application.  

#### Data generation

Data (bus routes, bus stops and map objects) is entered into Excel files (can be found in map_utilities\excel folder). Then a Python script generates JS files with data (in folder  work\main\js\generated_data). Python script an Excel files are not parts of the application, but are provided for reference.

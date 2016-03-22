================================================
Front end developer Udacity nano-degree 
Project 5 - neighbourhood map:
Abu Dhabi bus trip planner 
2016

For status on P5-specific review comments please refer to file P5ReviewItemsStatus.txt.

================================================
Introduction.
This readme note covers following topics: 
*Project motivation and explanation. 
*Overview and functionality.  
*Data generation. 
*Installing, building and running  the program.
*Meeting requirements of nano-degree project 5 and testing procedure.
================================================
Project motivation and explanation.

Project was done as a combination of personal project and project 5 of Udacity front end nano-degree. 
It is  a demo of a public transit trip planner for the city of Abu Dhabi.
On top of completing project 5,  motivations for this project were following: 
1) obtain more practice of coding in javascript 
2) have a project in personal portfolio that would be distinct from standard Udacity nano-degree projects
3)it can serve as a starting point for a larger personal project - a personalized public transit trip planner
4)there is actually a "business case": Abu Dhabi has a decent public transit system, but 
information is presented on the public transit web site in not very user friendly manner: there are no good maps 
(only a poorly scaled map for each route), on many occasions it is hard to impossible to tell how exactly 
certain point in a city can be reached, etc. Additionally, support of Abu Dhabi transit is not 
so good in Google maps.

Current version has multiple limitations (the most important ones are mentioned in the overview section),
 but is overall functional and fully meets requirements of the nano-degree project 5. 
================================================
Overview and functionality.  

There are 4 steps in the trip planning process: 
Step 1: 
Program starts with loading starting points of a possible bus trip (step 1).
For this version of the application only three starting points (sources)are available - all are residential 
communities. Selection of sources was made based on my knowledge of the city and bus routes. 
(Future versions will have capability to plan a trip from any point to any other point).
Sources are marked with green markers with "S".
User can select a desired source by clicking on the marker, clicking on the source name or typing source name in 
the text input area. Overall, list view, filter and markers work as per project 5 specifications, with one addition:  
at the end of step 1 user should apply filter to confirm final selection of desired source.
Since step 1 has only 3 objects in the list view, it does not meet a requirement of having 5 items in the list. 
This requirement is met in step 2.
Once source has been selected, user can click on next step button and  application will transition to step 2.

Step 2: 
Step 2  shows selected source and all destinations, available from that selected source. Destination is considered 
to be available from a source if 
1) there is a bus stop in less than 2000 m (straight line)from source
2) there is a bus stop in less than 2000 m from destination 
3) there is a bus route that connects these two stops.
Destinations are shown by blue markers with "D".
Selected source is always shown and is not part of the filtering logic. 
Current version of the application has 3 bus routes and a total of 18 destination objects (so requirements of project 5
are met in step 2 ). User should end up selecting one destination .
Once this is done, user can click on the next button to transition to step 3.

Step 3: 
Step 3 shows a list of bus routes which can take user from source to destination. In current version  of the 
program this step is not very informative - there is no obvious distinction between routes.  Step 3 is there at all because I plan to show routes in different colours or to show bus schedules in the subsequent versions. 
However, this limitation does not affect project meeting requirements of P5 of nano-degree, so for testing and evaluation 
purposes please click on any route. Please note that routes 180, 218, and 170 are indeed very similar if trip is from 
communities toward the city. 
Once route is selected, use can click on the next button, to move to the next step.

If during transition from step 2 to step 3 it is determined that there is only one bus route available for a selected 
source - destination pair - 
step 3 is skipped. 

Step 4: 
Step 4 shows : 
* a blue line connecting source bus stop with destination bus stop
* Google maps walking directions (in green)from source starting point to source bus stop and from destination bus stop 
to the final destination. 
May go for a full display of bus routes in the future, but for now rationale is that that trip planner is meant 
to help in walking directions, it does not really matter how exactly bus gets from a to b. I am thinking 
that providing estimated bus trip time would actually have way more value than plotting exact bus route.

From step 4, user can choose to start a new trip. 
In steps 2 and 3 user can go to previous step.
In current version of the program there is no previous step button in step 4 and 
information is not stored (i.e. if user goes from step 2 to step 1 - selected source will be reset).

Details on how distances are calculated, etc. can be found in the comments to the code. 
================================================
Data generation 

Data (bus routes, bus stops and map objects)is entered into Excel files 
(can be found in map_utilities\excel folder). Then a Python script generates 
JS files with data (in folder  work\main\js\generated_data).
Python script an Excel files are not parts of the application, but are provided for reference.
In the future versions of the program this data would come from the server side. 
================================================
Installing, building and running  the program.

Application utilizes Bower for package management and Gulp for builds. 
There are two main subfolders: 
src - sources with all libraries 
dist - built application.

To ensure all the required components are installed: 

0. Ensure you have node. js and npm installed. 
Refer to https://docs.npmjs.com/getting-started/installing-node for installation instructions. 
1. Please extract provided archive file. 
2. Ensure you have Bower installed. Please refer  to http://bower.io/ for Bower installation instructions. 
3. Please navigate to src sub-folder of the extracted archive. Start command line window (ensure you are still in the 
src folder). Run command 
"bower install"
This should created bower_components sub-folder and download all dependencies. 
4. Navigate one level up (into the main directory). Run command 
"npm install"
This will download and install all the gulp packages required for builds. 


To re-build the application: 
1) start command line in main directory.
2) execute command 
"gulp build"
This will clean up files in dist directory and rebuild the application. 

To test the program functionality: 
Option A: 
Please open index.html, located in dist subfolder with a browser. 

Option B (running local server): 
This procedure applies to Python 3, for Python 2 please google corresponding command for step 2:  
1. Run local server: 
cd /path/to/project-folder/dist
python -m http.server 8080

2. Open a browser and visit localhost:8080

================================================
Meeting requirements of nano-degree project 5 and testing procedure.

Functionality required by project 5 is fully present in step 1 and step 2.
However, step 1 has only three objects. Additionally, some filtering features are 
applicable only to list in step 2: in step 1 all communities have distinct names, so 
typing a matching word in an input area will always select one community. 
For these reasons I formally present step 2 for project 5 evaluation. 

To transition step 2: 
1) run the program 
2)Transition to step 2 . To do so,
a) select any community out of three (by clicking on a marker, by clicking on community name in the list or by typing community name in the text input area)
b) click 'next step'

Please note that source, selected in step 1, will always be displayed in step 2. it is not part of filtering 
logic. 

Step 2 presents following functionality as per project 5 requirements: 
- all destionations are displayed in a list view and as blue markers 
- clicking on an item in list view will transfer the item name into text input area and 
clear rest of items form list view 
- applying filter if only one item meets filter criteria will bounce corresponding marker, 
show info window on top of the selected marker (pcture from Panoramio API obtained via AJAX request)
and remove rest of the markers from the map
- there is real-time filtering: user can type location names into text input area, 
matching characters will be highlighted, and non-matching 
items will be removed in the list and map. I.e., if user types "mall" - list and map will display all malls, etc. 
- clicking on the marker will make it bounce, display info window and make corresponding item the 
only item in the list view

Error handling: if map is not available from the beginning, program will display a warning. 
However, trip planning can still be done. If connection is lost at final step, 
walking directions will be displayed as straight lines. 
If Panoramio data is not available, info window will display just item name, without picture. 




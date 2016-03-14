================================================
Front end developer Udacity nano-degree 
Project 5 - neighbourhood map:
Abu Dhabi bus trip planner 
2016

================================================
Introduction.
This readme note covers following topics: 
*Project motivation 
*Project overview 
*Data generation 
*How requirements of nano-degree project 5 are met
*Functionality relevant to project 5
*Installing and starting the program 
================================================
Project motivation. 

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
 but is overall functional and fully 
meets requirements of the nano-degree project 5. 
================================================
Overview.  

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
are met in step 2 ). User should end up selecting one destination (requires an additional application of filter to confirm).
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
How requirements of nano-degree project 5 are met

Functionality required by project 5 is fully present in step 1 and step 2.
However, since step 1 has only three objects, I formally present step 2 for project 5 evaluation. 
================================================

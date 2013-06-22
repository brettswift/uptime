How To Create Fixtures
======================

If you want to play with actual data, use the following scripts to create checks, pings, and compute the aggregated statistics for these test checks over the last month.

    > node fixtures/populate.js
    > node fixtures/computeStats.js

Then, before using the dashboard, turn on the dummy target.

    > node fixtures/dummyTarget.js

It's a simple server that responds to the fixture pings with a quality of service determined by the URL. For instance, 

    http://localhost:8888/90

will return HTTP status 200 90% of the time, and HTTP status 500 the rest of the time.



**Testing the ***jsonpath*** poller**

Just like the regular dummyTarget, if you want to test the jsonpath poller, you can do that by running 
	
	> node fixtures/dummyTargetJsonPath.js

This server takes two arguments.  One for % successful response as with the dummyTarget.  A second for % chance of a version upgrade. 
	 http://localhost:8888/99/1

This will return 99 % successful http get,  and 1% of the time the version will upgrade. 

The server uses the same jsonpath used in the hint text of the UI. 

```
	 <service>
	 	<status>
	 		<build>1.0.1.1001</build>
	 	</status>
	 </service>
```
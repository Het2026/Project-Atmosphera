/* Extra places: Name|CC|lat|lon|State or province|population (thousands, approx.)|elevation (m) */
const CITY_X=`Ghaziabad|IN|28.67|77.42|Uttar Pradesh|1730|214
Noida|IN|28.54|77.39|Uttar Pradesh|640|200
Gurugram|IN|28.46|77.03|Haryana|1050|217
Faridabad|IN|28.41|77.31|Haryana|1400|198
Kanpur|IN|26.45|80.35|Uttar Pradesh|2900|126
Agra|IN|27.18|78.02|Uttar Pradesh|1590|169
Prayagraj|IN|25.43|81.85|Uttar Pradesh|1110|98
Meerut|IN|28.98|77.71|Uttar Pradesh|1420|219
Ludhiana|IN|30.90|75.86|Punjab|1620|244
Jalandhar|IN|31.33|75.58|Punjab|870|228
Patiala|IN|30.34|76.39|Punjab|405|250
Dehradun|IN|30.32|78.03|Uttarakhand|580|640
Haridwar|IN|29.95|78.16|Uttarakhand|230|314
Srinagar|IN|34.08|74.80|Jammu and Kashmir|1190|1585
Jammu|IN|32.73|74.86|Jammu and Kashmir|500|327
Ambala|IN|30.38|76.78|Haryana|210|264
Jodhpur|IN|26.24|73.02|Rajasthan|1140|231
Udaipur|IN|24.58|73.71|Rajasthan|470|598
Jaisalmer|IN|26.92|70.91|Rajasthan|65|225
Kota|IN|25.18|75.84|Rajasthan|1000|271
Ajmer|IN|26.45|74.64|Rajasthan|550|486
Bikaner|IN|28.02|73.31|Rajasthan|650|224
Mount Abu|IN|24.59|72.71|Rajasthan|23|1220
Gwalior|IN|26.22|78.18|Madhya Pradesh|1100|197
Jabalpur|IN|23.18|79.99|Madhya Pradesh|1270|412
Ujjain|IN|23.18|75.78|Madhya Pradesh|515|491
Raipur|IN|21.25|81.63|Chhattisgarh|1010|298
Ranchi|IN|23.34|85.31|Jharkhand|1070|651
Jamshedpur|IN|22.80|86.20|Jharkhand|630|135
Dhanbad|IN|23.80|86.43|Jharkhand|1160|222
Patna|IN|25.59|85.14|Bihar|1680|53
Gaya|IN|24.80|85.00|Bihar|470|111
Bhubaneswar|IN|20.30|85.82|Odisha|890|45
Cuttack|IN|20.46|85.88|Odisha|610|36
Puri|IN|19.81|85.83|Odisha|200|3
Howrah|IN|22.59|88.26|West Bengal|1070|12
Siliguri|IN|26.73|88.43|West Bengal|510|122
Durgapur|IN|23.55|87.32|West Bengal|580|65
Asansol|IN|23.68|86.98|West Bengal|1200|110
Gangtok|IN|27.33|88.61|Sikkim|100|1650
Shillong|IN|25.57|91.88|Meghalaya|145|1496
Imphal|IN|24.82|93.94|Manipur|270|786
Aizawl|IN|23.73|92.72|Mizoram|290|1132
Kohima|IN|25.67|94.11|Nagaland|100|1261
Agartala|IN|23.83|91.28|Tripura|400|13
Itanagar|IN|27.10|93.62|Arunachal Pradesh|60|320
Dibrugarh|IN|27.48|94.91|Assam|155|108
Port Blair|IN|11.62|92.73|Andaman and Nicobar Islands|140|16
Rajkot|IN|22.30|70.80|Gujarat|1290|128
Bhavnagar|IN|21.76|72.15|Gujarat|600|24
Gandhinagar|IN|23.22|72.64|Gujarat|290|81
Jamnagar|IN|22.47|70.06|Gujarat|600|20
Bhuj|IN|23.25|69.67|Gujarat|150|110
Dwarka|IN|22.24|68.97|Gujarat|40|8
Aurangabad|IN|19.88|75.34|Maharashtra|1180|568
Solapur|IN|17.66|75.91|Maharashtra|950|458
Thane|IN|19.22|72.98|Maharashtra|1840|10
Navi Mumbai|IN|19.03|73.03|Maharashtra|1120|10
Pimpri-Chinchwad|IN|18.63|73.80|Maharashtra|1730|580
Amravati|IN|20.93|77.75|Maharashtra|650|343
Sangli|IN|16.85|74.57|Maharashtra|500|549
Nanded|IN|19.15|77.32|Maharashtra|550|357
Shirdi|IN|19.77|74.48|Maharashtra|36|498
Panchgani|IN|17.92|73.82|Maharashtra|17|1334
Matheran|IN|18.99|73.27|Maharashtra|5|800
Ratnagiri|IN|16.99|73.30|Maharashtra|75|10
Margao|IN|15.27|73.96|Goa|95|10
Mangaluru|IN|12.91|74.86|Karnataka|485|22
Hubballi|IN|15.36|75.12|Karnataka|940|671
Belagavi|IN|15.85|74.50|Karnataka|490|762
Madikeri|IN|12.42|75.74|Karnataka|35|1170
Gokarna|IN|14.55|74.32|Karnataka|25|10
Coimbatore|IN|11.02|76.96|Tamil Nadu|1050|411
Madurai|IN|9.93|78.12|Tamil Nadu|1020|134
Tiruchirappalli|IN|10.79|78.70|Tamil Nadu|860|88
Salem|IN|11.66|78.15|Tamil Nadu|830|278
Rameswaram|IN|9.29|79.31|Tamil Nadu|45|10
Kanyakumari|IN|8.08|77.54|Tamil Nadu|20|3
Kodaikanal|IN|10.24|77.49|Tamil Nadu|36|2133
Puducherry|IN|11.93|79.83|Puducherry|240|3
Vijayawada|IN|16.51|80.65|Andhra Pradesh|1050|11
Tirupati|IN|13.63|79.42|Andhra Pradesh|375|161
Guntur|IN|16.31|80.44|Andhra Pradesh|650|33
Warangal|IN|17.97|79.60|Telangana|620|266
Kozhikode|IN|11.26|75.78|Kerala|610|1
Thrissur|IN|10.53|76.21|Kerala|315|2
Alappuzha|IN|9.49|76.34|Kerala|175|1
Kollam|IN|8.89|76.61|Kerala|350|5
Kavaratti|IN|10.57|72.64|Lakshadweep|11|2
Philadelphia|US|39.95|-75.17|Pennsylvania|1600|12
San Antonio|US|29.42|-98.49|Texas|1500|198
San Diego|US|32.72|-117.16|California|1390|19
Dallas|US|32.78|-96.80|Texas|1300|131
Austin|US|30.27|-97.74|Texas|980|149
Jacksonville|US|30.33|-81.66|Florida|950|5
Fort Worth|US|32.76|-97.33|Texas|950|196
San Jose|US|37.34|-121.89|California|1000|26
Columbus|US|39.96|-83.00|Ohio|910|275
Charlotte|US|35.23|-80.84|North Carolina|880|229
Indianapolis|US|39.77|-86.16|Indiana|880|218
Detroit|US|42.33|-83.05|Michigan|640|183
Minneapolis|US|44.98|-93.27|Minnesota|430|264
Las Vegas|US|36.17|-115.14|Nevada|650|610
Portland (Oregon)|US|45.52|-122.68|Oregon|650|15
Salt Lake City|US|40.76|-111.89|Utah|210|1288
Washington, D.C.|US|38.91|-77.04|District of Columbia|690|7
Baltimore|US|39.29|-76.61|Maryland|585|10
Nashville|US|36.16|-86.78|Tennessee|690|180
Memphis|US|35.15|-90.05|Tennessee|630|103
New Orleans|US|29.95|-90.07|Louisiana|380|2
Kansas City|US|39.10|-94.58|Missouri|510|277
St. Louis|US|38.63|-90.20|Missouri|295|142
Cleveland|US|41.50|-81.69|Ohio|370|199
Pittsburgh|US|40.44|-79.99|Pennsylvania|300|230
Cincinnati|US|39.10|-84.51|Ohio|310|147
Milwaukee|US|43.04|-87.91|Wisconsin|575|188
Orlando|US|28.54|-81.38|Florida|310|29
Tampa|US|27.95|-82.46|Florida|385|15
Raleigh|US|35.78|-78.64|North Carolina|470|96
Oklahoma City|US|35.47|-97.52|Oklahoma|690|366
Albuquerque|US|35.08|-106.65|New Mexico|560|1619
Tucson|US|32.22|-110.97|Arizona|545|728
Sacramento|US|38.58|-121.49|California|525|9
Omaha|US|41.26|-95.93|Nebraska|485|332
Boise|US|43.62|-116.20|Idaho|235|824
Buffalo|US|42.89|-78.88|New York|278|180
Richmond (Virginia)|US|37.54|-77.44|Virginia|230|50
Louisville|US|38.25|-85.76|Kentucky|630|142
Birmingham (Alabama)|US|33.52|-86.80|Alabama|200|140
Charleston (South Carolina)|US|32.78|-79.93|South Carolina|150|3
Savannah|US|32.08|-81.09|Georgia|147|15
Providence|US|41.82|-71.41|Rhode Island|190|23
Hartford|US|41.76|-72.68|Connecticut|120|18
Albany|US|42.65|-73.75|New York|100|9
Burlington (Vermont)|US|44.48|-73.21|Vermont|45|61
Portland (Maine)|US|43.66|-70.26|Maine|68|11
Des Moines|US|41.59|-93.62|Iowa|210|290
Madison|US|43.07|-89.40|Wisconsin|270|262
Fargo|US|46.88|-96.79|North Dakota|125|276
Sioux Falls|US|43.55|-96.73|South Dakota|195|435
Billings|US|45.78|-108.50|Montana|117|947
Cheyenne|US|41.14|-104.82|Wyoming|65|1848
Jackson (Wyoming)|US|43.48|-110.76|Wyoming|11|1900
Fairbanks|US|64.84|-147.72|Alaska|32|136
Juneau|US|58.30|-134.42|Alaska|32|17
Reno|US|39.53|-119.81|Nevada|265|1373
Santa Fe|US|35.69|-105.94|New Mexico|88|2194
Flagstaff|US|35.20|-111.65|Arizona|77|2106
Furnace Creek (Death Valley)|US|36.46|-116.87|California|0.1|-54
West Yellowstone|US|44.66|-111.10|Montana|1|2030
Hilo|US|19.72|-155.09|Hawaii|45|11
Little Rock|US|34.75|-92.29|Arkansas|200|102
Jackson (Mississippi)|US|32.30|-90.18|Mississippi|150|90
Colorado Springs|US|38.83|-104.82|Colorado|485|1839
Aspen|US|39.19|-106.82|Colorado|7|2400
Duluth|US|46.79|-92.10|Minnesota|87|183
Calgary|CA|51.05|-114.07|Alberta|1305|1045
Edmonton|CA|53.55|-113.49|Alberta|1010|645
Ottawa|CA|45.42|-75.70|Ontario|1015|70
Winnipeg|CA|49.90|-97.14|Manitoba|750|239
Mississauga|CA|43.59|-79.64|Ontario|720|156
Québec City|CA|46.81|-71.21|Quebec|550|98
Halifax|CA|44.65|-63.57|Nova Scotia|440|20
Saskatoon|CA|52.13|-106.67|Saskatchewan|275|482
Regina|CA|50.45|-104.62|Saskatchewan|230|577
Victoria|CA|48.43|-123.37|British Columbia|92|20
Hamilton (Ontario)|CA|43.26|-79.87|Ontario|570|90
London (Ontario)|CA|42.98|-81.25|Ontario|425|251
Kitchener|CA|43.45|-80.49|Ontario|256|340
Windsor (Ontario)|CA|42.32|-83.04|Ontario|230|190
Niagara Falls|CA|43.09|-79.08|Ontario|95|180
Thunder Bay|CA|48.38|-89.25|Ontario|108|199
Sudbury|CA|46.49|-81.00|Ontario|162|270
Kingston|CA|44.23|-76.49|Ontario|132|93
Fredericton|CA|45.96|-66.64|New Brunswick|60|8
Moncton|CA|46.09|-64.78|New Brunswick|80|35
Charlottetown|CA|46.24|-63.13|Prince Edward Island|38|10
St. John's|CA|47.56|-52.71|Newfoundland and Labrador|110|60
Whitehorse|CA|60.72|-135.06|Yukon|28|660
Yellowknife|CA|62.45|-114.37|Northwest Territories|20|200
Iqaluit|CA|63.75|-68.52|Nunavut|8|34
Kelowna|CA|49.89|-119.50|British Columbia|145|344
Whistler|CA|50.12|-122.95|British Columbia|13|675
Jasper|CA|52.87|-118.08|Alberta|5|1062
Lethbridge|CA|49.69|-112.84|Alberta|100|920
Red Deer|CA|52.27|-113.81|Alberta|100|905
Prince George|CA|53.92|-122.75|British Columbia|77|575
Churchill|CA|58.77|-94.17|Manitoba|0.9|29
Inuvik|CA|68.36|-133.72|Northwest Territories|3|15
Tofino|CA|49.15|-125.90|British Columbia|2|10`;
/* Region and population for places already in the first list */
const INFO={Delhi:['Delhi',32000],Mumbai:['Maharashtra',21000],Kolkata:['West Bengal',15000],Chennai:['Tamil Nadu',11500],Hyderabad:['Telangana',10500],Bengaluru:['Karnataka',13000],Ahmedabad:['Gujarat',8400],Pune:['Maharashtra',7200],Jaipur:['Rajasthan',4000],Lucknow:['Uttar Pradesh',3800],Nagpur:['Maharashtra',2800],Surat:['Gujarat',7000],Nashik:['Maharashtra',2000],Kochi:['Kerala',2200],Panaji:['Goa',115],Varanasi:['Uttar Pradesh',1600],Chandigarh:['Chandigarh',1200],Bhopal:['Madhya Pradesh',2300],Indore:['Madhya Pradesh',3300],Vadodara:['Gujarat',2200],Guwahati:['Assam',1100],Thiruvananthapuram:['Kerala',1700],Visakhapatnam:['Andhra Pradesh',2200],Mysuru:['Karnataka',1100],Amritsar:['Punjab',1400],Leh:['Ladakh',45],Shimla:['Himachal Pradesh',210],Lonavala:['Maharashtra',60],Mahabaleshwar:['Maharashtra',15],Ooty:['Tamil Nadu',90],Munnar:['Kerala',70],Manali:['Himachal Pradesh',10],Darjeeling:['West Bengal',120],Rishikesh:['Uttarakhand',100],Hampi:['Karnataka',3],Pushkar:['Rajasthan',22],Alibag:['Maharashtra',20],Kolhapur:['Maharashtra',700],Satara:['Maharashtra',160],
'New York':['New York',8300],'Los Angeles':['California',3900],Chicago:['Illinois',2700],Houston:['Texas',2300],Miami:['Florida',450],'San Francisco':['California',810],Honolulu:['Hawaii',350],Anchorage:['Alaska',290],Denver:['Colorado',715],Seattle:['Washington',750],Phoenix:['Arizona',1650],Atlanta:['Georgia',500],Boston:['Massachusetts',650],Sedona:['Arizona',10],'Key West':['Florida',26],
Toronto:['Ontario',2800],Vancouver:['British Columbia',675],'Montréal':['Quebec',1760],'Dawson City':['Yukon',1.5],Banff:['Alberta',8]};
/* Real time zones (standard time, valid Nov to early Mar). Everywhere else shows local solar time. */
const TZ_REGION={
 'New York':[-5,'ET'],Pennsylvania:[-5,'ET'],Massachusetts:[-5,'ET'],Florida:[-5,'ET'],Georgia:[-5,'ET'],'North Carolina':[-5,'ET'],'South Carolina':[-5,'ET'],Virginia:[-5,'ET'],Maryland:[-5,'ET'],'District of Columbia':[-5,'ET'],Ohio:[-5,'ET'],Michigan:[-5,'ET'],Indiana:[-5,'ET'],Kentucky:[-5,'ET'],Connecticut:[-5,'ET'],'Rhode Island':[-5,'ET'],Vermont:[-5,'ET'],Maine:[-5,'ET'],
 Illinois:[-6,'CT'],Texas:[-6,'CT'],Missouri:[-6,'CT'],Minnesota:[-6,'CT'],Wisconsin:[-6,'CT'],Louisiana:[-6,'CT'],Alabama:[-6,'CT'],Mississippi:[-6,'CT'],Oklahoma:[-6,'CT'],Iowa:[-6,'CT'],Arkansas:[-6,'CT'],Nebraska:[-6,'CT'],'North Dakota':[-6,'CT'],'South Dakota':[-6,'CT'],Tennessee:[-6,'CT'],
 Colorado:[-7,'MT'],Utah:[-7,'MT'],'New Mexico':[-7,'MT'],Wyoming:[-7,'MT'],Montana:[-7,'MT'],Idaho:[-7,'MT'],Arizona:[-7,'MST'],
 California:[-8,'PT'],Washington:[-8,'PT'],Oregon:[-8,'PT'],Nevada:[-8,'PT'],Alaska:[-9,'AKT'],Hawaii:[-10,'HST'],
 Ontario:[-5,'ET'],Quebec:[-5,'ET'],Nunavut:[-5,'ET'],Manitoba:[-6,'CT'],Saskatchewan:[-6,'CST'],Alberta:[-7,'MT'],'British Columbia':[-8,'PT'],Yukon:[-7,'MST'],'Northwest Territories':[-7,'MT'],
 'New Brunswick':[-4,'AT'],'Nova Scotia':[-4,'AT'],'Prince Edward Island':[-4,'AT'],'Newfoundland and Labrador':[-3.5,'NT']
};
const TZ_CC={IN:[5.5,'IST'],GB:[0,'GMT'],IE:[0,'GMT'],PT:[0,'WET'],IS:[0,'GMT'],FR:[1,'CET'],DE:[1,'CET'],ES:[1,'CET'],IT:[1,'CET'],NL:[1,'CET'],CH:[1,'CET'],AT:[1,'CET'],CZ:[1,'CET'],PL:[1,'CET'],HU:[1,'CET'],NO:[1,'CET'],SE:[1,'CET'],GR:[2,'EET'],FI:[2,'EET'],UA:[2,'EET'],TR:[3,'TRT'],EG:[2,'EET'],SA:[3,'AST'],IQ:[3,'AST'],IR:[3.5,'IRST'],AE:[4,'GST'],OM:[4,'GST'],QA:[3,'AST'],PK:[5,'PKT'],LK:[5.5,'IST'],NP:[5.75,'NPT'],BD:[6,'BST'],TH:[7,'ICT'],VN:[7,'ICT'],SG:[8,'SGT'],MY:[8,'MYT'],PH:[8,'PHT'],CN:[8,'CST'],HK:[8,'HKT'],TW:[8,'CST'],JP:[9,'JST'],KR:[9,'KST'],NG:[1,'WAT'],KE:[3,'EAT'],ET:[3,'EAT'],ZA:[2,'SAST'],MA:[1,'WET']};
const POLL2={Ghaziabad:196,Noida:204,Gurugram:188,Faridabad:176,Kanpur:172,Patna:166,Agra:152,Prayagraj:142,Meerut:171,Ludhiana:162,Jalandhar:138,Howrah:150,Asansol:131,Dhanbad:151,Raipur:126,Ranchi:112,Gwalior:132,Jabalpur:106,Jodhpur:101,Kota:98,Ajmer:96,Srinagar:84,Jammu:110,Dehradun:92,Haridwar:104,Patiala:120,Ambala:118,Thane:118,'Navi Mumbai':112,'Pimpri-Chinchwad':104,Aurangabad:92,Solapur:90,Nanded:78,Bhubaneswar:88,Cuttack:92,Gaya:121,Siliguri:99,Durgapur:112,Agartala:70,Imphal:60,Rajkot:102,Gandhinagar:98,Jamnagar:92,Vijayawada:84,Coimbatore:62,Madurai:68,Salem:70,Detroit:62,'Las Vegas':56,Phoenix:70,Sacramento:66,'San Jose':58,Fairbanks:74,'Salt Lake City':72};
Object.assign(POLL,POLL2);

the chnages that ned int he db are the following 
1. subjects
    1. subject id 
    2. subject name 
    3. subject year 
    4. subject description 
    5. credits
    6. dept_id
    7. semster
    8. created_at
    9. updated_at
2. Users
    1. user_id
    2. name
    3. phonenumber
    4. role
    5. created_at
    6. updated_at
    7. password_hash
    8. explain why there is dept and assigned year
3. remove the start and end time of the semster
4. don;t send the daily message notification about the  less than 80%  
5.     LUNCH["⏰ After lunch / end of day"] --> CHECK_DAILY{"Daily attendance\n< 80%?"}
    CHECK_DAILY -- YES --> SMS2["📱 Daily Summary SMS"]
    CHECK_DAILY -- NO --> SKIP1["No daily SMS"]
 i don't nee this 
 6. princpal can put the foloowing 
	 1. absent,present,od,informed leave
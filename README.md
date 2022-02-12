# Bookings App for Fortress

This is a bookings app

- by Josh Zirena

1. The project took me about 3-4 hours in total, but most of my time was spent troubleshooting for overlapping dates.
2. Most of my code is expected to have a runtime complexity of O(n) because we are mapping through the requests that we are given. However, there are some points in which the code will dip into O(n log n) and small part in O(n^2), though I did my best to minimize that as much as possible. Nevertheless, the
   code seems to run well even at 1000 requests. With that being said, I am a firm believe that anything can be improved.
3. One idea to handle remaining availability, weekends, etc would be to add some sort of multiplier to the overall base costs of cleaning (for events) and daily rate (based on availability)

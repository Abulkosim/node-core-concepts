1. *read a large file without loading it all*
  *count lines, words
   find the longest line 
   log memory usage*
2. *transform stream*
  *uppercase only alphabetic chars 
   redact emails 
   convert csv into ndjson
   prepend line numbers*

*2026-03-23 email=[john@example.com](mailto:john@example.com) action=login
2026-03-23 email=[REDACTED] action=login*

1. *use pipeline in a complete flow*
  *read stream 
   transform stream 
   write stream*

*example: read a file, redact emails, gzip the result, write to a new fiele* 

1. master the following:
  readable, writeable, transform
   pipeline()
   backpressure 
   highwatermark 
   chunk boundaries 
   transform and flush
   error handling


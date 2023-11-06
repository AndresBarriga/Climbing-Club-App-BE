
DELETE FROM session
WHERE expire < NOW();
#!/bin/bash
for x in exercise-exactly-4-minutes-per-day.jpg luxury.jpg meet-death.jpg this-is-ikea.jpg; do
  curl -O https://substack.net/zine/$x
done

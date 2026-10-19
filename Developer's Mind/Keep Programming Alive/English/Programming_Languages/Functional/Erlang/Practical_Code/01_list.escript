#!/usr/bin/env escript
main(_) ->
    Scores = [1, 2, 3],
    io:format("~p~n", [[N * 2 || N <- Scores]]).

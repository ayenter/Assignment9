var main = function (toDoObjs, socket) {
    "use strict";
    console.log("running");


    //https://github.com/semmypurewal/LearningWebAppDev/tree/master/Chapter7/app/Amazeriffic
    var toDos = toDoObjs.map(function (toDo) {
        // we'll just return the description
        // of this toDoObject
        return toDo.description;
    });

    $(".tabs a span").toArray().forEach(function (element) {
        var $element = $(element);

        // create a click handler for this element
        $element.on("click", function () {
            var $content,
                $input,
                $button,
                i;

            $(".tabs a span").removeClass("active");
            $element.addClass("active");
            $("main .content").empty();

            if ($element.parent().is(":nth-child(1)")) {
                // newest first, so we have to go through
                // the array backwards
                $content = $("<ul>");
                for (i = toDos.length-1; i >= 0; i--) {
                    $content.append($("<li>").text(toDos[i]));
                }
            } else if ($element.parent().is(":nth-child(2)")) {
                // oldest first, so we go through the array forwards
                $content = $("<ul>");
                toDos.forEach(function (todo) {
                    $content.append($("<li>").text(todo));
                });
            } else if ($element.parent().is(":nth-child(3)")){
                var tags = [];

                toDoObjs.forEach(function (toDo) {
                    toDo.tags.forEach(function (tag) {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                });

                var tagObjs = tags.map(function (tag) {

                    var toDosWithTag = [];

                    toDoObjs.forEach(function (toDo) {
                        if (toDo.tags.indexOf(tag) !== -1) {
                            toDosWithTag.push(toDo.description);
                        }
                    });

                    return { "name": tag, "toDos": toDosWithTag };
                });

                tagObjs.forEach(function (tag) {
                    var $tagName = $("<h4>").text(tag.name),
                    $content = $("<ul>");

                    tag.toDos.forEach(function (description) {
                        var $li = $("<li>").text(description);
                        $content.append($li);
                    });

                    $("main .content").append($tagName);
                    $("main .content").append($content);
                });
            }else if ($element.parent().is(":nth-child(4)")) {
                // input a new to-do
                $input = $("<input>").addClass("description");
                $button = $("<button>").text("+");
                var $inputLabel = $("<p>").text("Description: "),
                    $tagInput = $("<input>").addClass("tags"),
                    $tagLabel = $("<p>").text("Tags: ");

                $button.on("click", function () {
                    if ($input.val() !== "") {
                        var description = $input.val(),
                            tags = $tagInput.val().split(","),
                            newToDo = {"description":description, "tags":tags};

                        $.post("todos", newToDo, function (result) {
                            console.log(result);

                            //toDoObjs.push(newToDo);
                            toDoObjs = result;

                            // update toDos
                            toDos = toDoObjs.map(function (toDo) {
                                return toDo.description;
                            });
                            $input.val("");
                            $tagInput.val("");
                        });
                    }
                });

                $content = $("<div>").append($inputLabel)
                                     .append($input)
                                     .append($tagLabel)
                                     .append($tagInput)
                                     .append($button);
               /* Alternatively append() allows multiple arguments so the above
                can be done with $content = $("<div>").append($input, $button); */
            }
            $("main .content").append($content);
            

            return false;
        });
    });

    $(".tabs a:first-child span").trigger("click");

    
//------------------SOCKET-----------------------
    socket.on('update', function(newToDo){
        var $content,
                i;
        console.log(newToDo);
        toDoObjs.push({"description": newToDo.description, "tags": newToDo.tags});
        toDos = toDoObjs.map(function (toDo) {
            // we'll just return the description
            // of this toDoObject
            return toDo.description;
        });
        if ($('.active').parent().is(":nth-child(1)")) {
            $("main .content").empty();
            $content = $("<ul>");
            for (i = toDos.length-1; i >= 0; i--) {
                $content.append($("<li>").text(toDos[i]));
            }
            $("main .content").append($content);
        } else if ($('.active').parent().is(":nth-child(2)")) {
            $("main .content").empty();
            $content = $("<ul>");
            toDos.forEach(function (todo) {
                $content.append($("<li>").text(todo));
            });
            $("main .content").append($content);
        } else if ($('.active').parent().is(":nth-child(3)")) {
            $.getJSON("todos.json", function (toDoObjs2) {
                $("main .content").empty();
                var tags = [];
                console.log(toDoObjs2);

                toDoObjs2.forEach(function (toDo) {
                    toDo.tags.forEach(function (tag) {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                });

                var tagObjs = tags.map(function (tag) {

                    var toDosWithTag = [];

                    toDoObjs2.forEach(function (toDo) {
                        if (toDo.tags.indexOf(tag) !== -1) {
                            toDosWithTag.push(toDo.description);
                        }
                    });

                    return { "name": tag, "toDos": toDosWithTag };
                });

                tagObjs.forEach(function (tag) {
                    var $tagName = $("<h4>").text(tag.name),
                    $content = $("<ul>");

                    tag.toDos.forEach(function (description) {
                        var $li = $("<li>").text(description);
                        $content.append($li);
                    });

                    $("main .content").append($tagName);
                    $("main .content").append($content);
                });
            });
        }
    });
}
var socket;
$(document).ready(function () {
    socket = io.connect();
    $.getJSON("todos.json", function (toDoObjs) {
        main(toDoObjs, socket);
    });
});


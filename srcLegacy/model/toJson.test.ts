import { toJson } from "./toJson";

it("ignores internal props", () => {
  expect(
    toJson({
      $a: 1,
      $b: 2,
      id: "id"
    } as any)
  ).toEqual({ id: "id" });
});

it("resolves models", () => {
  expect(
    toJson({
      id: "id",
      todo: {
        $factory: true,
        id: "todo-id",
        todo: "todo"
      }
    } as any)
  ).toEqual({ id: "id", todo: { id: "todo-id", todo: "todo" } });
});

it("resolves nested models and arrays", () => {
  expect(
    toJson({
      id: "id",
      todo: [
        {
          $factory: true,
          id: "todo-id",
          todo: "todo"
        },
        {
          $factory: true,
          id: "todo-id-2",
          todo: "todo-2",
          list: {
            $factory: true,
            id: "list-id",
            name: "list-name"
          }
        }
      ]
    } as any)
  ).toEqual({
    id: "id",
    todo: [
      { id: "todo-id", todo: "todo" },
      {
        id: "todo-id-2",
        list: { id: "list-id", name: "list-name" },
        todo: "todo-2"
      }
    ]
  });
});

it("resolves max depths", () => {
  expect(
    toJson({
      id: "id",
      todo: {
        $factory: true,
        id: "todo-id-2",
        todo: "todo-2",
        list: {
          $factory: true,
          id: "list-id-1",
          name: "list-name",
          list: {
            $factory: true,
            id: "list-id-2",
            name: "list-name",
            list: {
              $factory: true,
              id: "list-id-3",
              name: "list-name",
              list: {
                $factory: true,
                id: "list-id-4",
                name: "list-name",
                list: {
                  $factory: true,
                  id: "list-id-5",
                  name: "list-name",
                  list: {
                    $factory: true,
                    id: "list-id-6",
                    name: "list-name"
                  }
                }
              }
            }
          }
        }
      }
    } as any)
  ).toEqual({
    id: "id",
    todo: {
      id: "todo-id-2",
      list: {
        id: "list-id-1",
        list: {
          id: "list-id-2",
          list: {
            id: "list-id-3",
            list: { id: "list-id-4", list: undefined, name: "list-name" },
            name: "list-name"
          },
          name: "list-name"
        },
        name: "list-name"
      },
      todo: "todo-2"
    }
  });
});

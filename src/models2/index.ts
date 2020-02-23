import { assignRelationships } from "./assignRelationships";
import {
  ModelArgs,
  Model,
  ModelFactory,
  ModelFactoryArgsFromModelArgs,
  ModelArgsPropertyType
} from "./types";

function createModel<Args extends ModelArgs>(opts: Args): ModelFactory<Args> {
  function modelFactory(
    initialValue: ModelFactoryArgsFromModelArgs<Args>
  ): Model<Args> {
    const modelData = initialValue;

    const regularProps = {};
    const computedProps = {};
    const relationshipsProps = {};
    const internalProps = {
      $factory: modelFactory
    };

    for (const prop in opts.properties) {
      const propArguments = opts.properties[prop];
      switch (propArguments.type) {
        case ModelArgsPropertyType.COMPUTED:
          computedProps[prop] = () => {
            // Copy the data so computed props can't modify props directly
            const newProps = Object.assign({}, modelData);
            return propArguments.compute(newProps);
          };
          break;
        case ModelArgsPropertyType.RELATIONSHIP:
          relationshipsProps[prop] = assignRelationships(
            propArguments,
            modelData[prop]
          );
          break;
        default:
          regularProps[prop] = modelData[prop];
      }
    }

    return Object.assign(
      {},
      regularProps,
      computedProps,
      relationshipsProps,
      internalProps
    );
  }

  return modelFactory;
}

const Todo = createModel({
  properties: {
    name: {
      type: ModelArgsPropertyType.STRING
    }
  }
});

type Todo = ReturnType<typeof Todo>;

const User = createModel({
  properties: {
    firstName: {
      type: ModelArgsPropertyType.STRING,
      required: true
    },
    lastName: {
      type: ModelArgsPropertyType.STRING,
      required: true
    },
    employeeId: {
      type: ModelArgsPropertyType.NUMBER,
      required: true
    },
    about: {
      type: ModelArgsPropertyType.STRING
    },
    mainTodo: {
      type: ModelArgsPropertyType.RELATIONSHIP,
      modelFactory: Todo
    },
    todos: {
      type: ModelArgsPropertyType.RELATIONSHIP,
      modelFactory: Todo,
      many: true
    },
    name: {
      type: ModelArgsPropertyType.COMPUTED,
      compute: props => props.firstName + " " + props.lastName
    }
  }
});

type User = ReturnType<typeof User>;

const mike = User({
  firstName: "First",
  lastName: "Last",
  employeeId: 123456789
});

mike.todos;

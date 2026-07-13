import {CreateInputParameterValueRequest} from "./CreateInputParameterValueRequest";
import {PriceType} from "../../util/PriceType";

export interface CreateHouseRequest {
    id?: number | null;
    deletedMultipartFiles?: File[];

    requester: string | null | undefined;
    number: number | null | undefined;

    name: string | null;
    description: string | null;
    price: number | null | undefined;
    priceType: string | null | undefined;
    location: string | null | undefined;
    type: string | null;

    mainCategoryId: number | null | undefined;
    subCategoryId: number | null | undefined;

    imagesPaths?: string[] | [];

    selectiveParameterValuesIds: number[];

    inputParameterValues: CreateInputParameterValueRequest[];
}

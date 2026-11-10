import { productBuilder } from "../model/builder/product.builder";
import { Product } from "../model/product.model";
import { IMapper } from "./IMapper";

export interface productRow{
    id :string;
    name :string;
    description :string;
    price :number;
    salePrice :number | null;
    discountPercent :number;
    onSale:number;
    stock :number;
    collectionId:string | null;
    imgSrc :string;
    category:string
}

export class productMapper implements IMapper<productRow,Product>{
    map(data: productRow): Product {
        return productBuilder.newProductBuilder().setId(data.id).setName(data.name).setDescription(data.description).setPrice(data.price).setSalePrice(data.salePrice)
        .setDiscountPercent(data.discountPercent).setonSale(data.onSale?true:false).setStock(data.stock).setcollectionId(data.collectionId).setImgSrc(data.imgSrc).setCategory(data.category).build();
    }
    reverseMap(data: Product): productRow {
        throw new Error("Method not implemented.");
    }
    
}
import { Product } from "./types";
import { ProductSpecification } from "./ProductSpecification";
import { Request, Response } from "express";
import SingletonDB from "./SingletonDB";

export default class ShopController {
	private db: SingletonDB;

	constructor() {
		this.db = SingletonDB.getInstance();
	}

	getPriceList = async (_: Request, res: Response) => {
		this.db.connect("DetailedProvider");
		const data: Array<Product> = await this.db.getPriceList("Product");

		res.status(200).json(data);
	};

	getDetailed = async (req: Request, res: Response) => {
		const data: Array<Product> = await this.getAllRows("DetailedProvider");

		const productById = new ProductSpecification(data, req.params);

		res
			.status(200)
			.json(
				productById.getSatisfiedBy().length === 0
					? { message: "Can't find data!" }
					: productById.getSatisfiedBy(),
			);
	};

	combineData = async (_: Request, res: Response) => {
		const dbData: Array<Product> = await this.getAllRows("SportShopDB");
		const firstProvider: Array<Product> = await this.getAllRows(
			"DetailedProvider",
		);
		const secondProvider: Array<Product> = await this.getAllRows(
			"FilteredProvider",
		);

		res.status(200).json([...dbData, ...firstProvider, ...secondProvider]);
	};

	filterBy = async (req: Request, res: Response) => {
		this.db.connect("FilteredProvider");
		const data = await this.db.filterBy();

		const filteredByParams = new ProductSpecification(data, req.query);

		res.status(200).json(filteredByParams.getSatisfiedBy());
	};

	getAllRows = async (database: string) => {
		this.db.connect(database);

		const data = await this.db.getAll(database);

		return data;
	};
}